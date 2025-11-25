drop extension if exists "pg_net";

create type "public"."workout_status_enum" as enum ('planned', 'in_progress', 'completed');


  create table "public"."exercises" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "target_muscle_group" text not null,
    "description" text,
    "external_link" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "display_name" text
      );



  create table "public"."workout_session_exercises" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid not null,
    "exercise_id" uuid not null,
    "order_in_session" smallint not null default 1,
    "is_completed" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."workout_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "session_date" date not null,
    "title" text,
    "status" workout_status_enum not null default 'planned'::workout_status_enum,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."workout_sets" (
    "id" uuid not null default gen_random_uuid(),
    "session_exercise_id" uuid not null,
    "set_order" smallint not null,
    "planned_reps" integer,
    "planned_weight" numeric(6,2),
    "actual_reps" integer,
    "actual_weight" numeric(6,2),
    "is_completed" boolean not null default false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE UNIQUE INDEX exercises_pkey ON public.exercises USING btree (id);

CREATE UNIQUE INDEX exercises_user_name_unique ON public.exercises USING btree (user_id, name);

CREATE INDEX idx_session_exercises_exercise_id ON public.workout_session_exercises USING btree (exercise_id);

CREATE INDEX idx_session_exercises_session_id ON public.workout_session_exercises USING btree (session_id);

CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions USING btree (user_id, session_date);

CREATE INDEX idx_workout_sets_session_exercise ON public.workout_sets USING btree (session_exercise_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX workout_session_exercises_pkey ON public.workout_session_exercises USING btree (id);

CREATE UNIQUE INDEX workout_sessions_pkey ON public.workout_sessions USING btree (id);

CREATE UNIQUE INDEX workout_sessions_user_date_unique ON public.workout_sessions USING btree (user_id, session_date);

CREATE UNIQUE INDEX workout_sets_pkey ON public.workout_sets USING btree (id);

alter table "public"."exercises" add constraint "exercises_pkey" PRIMARY KEY using index "exercises_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."workout_session_exercises" add constraint "workout_session_exercises_pkey" PRIMARY KEY using index "workout_session_exercises_pkey";

alter table "public"."workout_sessions" add constraint "workout_sessions_pkey" PRIMARY KEY using index "workout_sessions_pkey";

alter table "public"."workout_sets" add constraint "workout_sets_pkey" PRIMARY KEY using index "workout_sets_pkey";

alter table "public"."exercises" add constraint "exercises_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."exercises" validate constraint "exercises_user_id_fkey";

alter table "public"."exercises" add constraint "exercises_user_name_unique" UNIQUE using index "exercises_user_name_unique";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."workout_session_exercises" add constraint "workout_session_exercises_exercise_id_fkey" FOREIGN KEY (exercise_id) REFERENCES exercises(id) not valid;

alter table "public"."workout_session_exercises" validate constraint "workout_session_exercises_exercise_id_fkey";

alter table "public"."workout_session_exercises" add constraint "workout_session_exercises_session_id_fkey" FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE not valid;

alter table "public"."workout_session_exercises" validate constraint "workout_session_exercises_session_id_fkey";

alter table "public"."workout_sessions" add constraint "workout_sessions_user_date_unique" UNIQUE using index "workout_sessions_user_date_unique";

alter table "public"."workout_sessions" add constraint "workout_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workout_sessions" validate constraint "workout_sessions_user_id_fkey";

alter table "public"."workout_sets" add constraint "workout_sets_session_exercise_id_fkey" FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id) ON DELETE CASCADE not valid;

alter table "public"."workout_sets" validate constraint "workout_sets_session_exercise_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_workout_status_from_sets()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  v_session_exercise_id    uuid;
  v_session_id             uuid;
  v_all_sets_completed     boolean;
  v_has_any_completed_set  boolean;
  v_all_exercises_completed boolean;
begin
  -- 어떤 세트/운동이 영향을 받았는지 가져오기
  v_session_exercise_id := coalesce(new.session_exercise_id, old.session_exercise_id);

  if v_session_exercise_id is null then
    return null;
  end if;

  select session_id
  into v_session_id
  from public.workout_session_exercises
  where id = v_session_exercise_id;

  if v_session_id is null then
    return null;
  end if;

  -- -------------------------------------------------------
  -- 1) 운동 단위(workout_session_exercises.is_completed) 갱신
  --    - 해당 운동에 is_completed = false 인 세트가 하나라도 있으면 false
  --    - 아니면 true
  -- -------------------------------------------------------
  select
    case
      when exists (
        select 1
        from public.workout_sets s
        where s.session_exercise_id = v_session_exercise_id
          and s.is_completed = false
      )
      then false
      else true
    end
  into v_all_sets_completed;

  update public.workout_session_exercises
  set
    is_completed = v_all_sets_completed,
    updated_at   = now()
  where id = v_session_exercise_id;

  -- -------------------------------------------------------
  -- 2) 세션 단위(workout_sessions.status) 갱신
  --
  --   기준:
  --   - has_any_completed_set: 세션 안에 완료된 세트가 하나라도 있는가?
  --   - all_exercises_completed: 세션 안의 모든 운동이 is_completed = true 인가?
  --
  --   상태 결정:
  --   - all_exercises_completed && has_any_completed_set => 'completed'
  --   - has_any_completed_set                           => 'in_progress'
  --   - 그 외                                           => 'planned'
  --   (즉, 토글로 세트를 해제해도 상태가 되돌아감)
  -- -------------------------------------------------------
  select
    exists (
      select 1
      from public.workout_sets s
      join public.workout_session_exercises e
        on e.id = s.session_exercise_id
      where e.session_id = v_session_id
        and s.is_completed = true
    ) as has_any_completed_set,
    not exists (
      select 1
      from public.workout_session_exercises e
      where e.session_id = v_session_id
        and e.is_completed = false
    ) as all_exercises_completed
  into v_has_any_completed_set, v_all_exercises_completed;

  if v_all_exercises_completed and v_has_any_completed_set then
    update public.workout_sessions
    set status    = 'completed',
        updated_at = now()
    where id = v_session_id;

  elsif v_has_any_completed_set then
    update public.workout_sessions
    set status    = 'in_progress',
        updated_at = now()
    where id = v_session_id;

  else
    update public.workout_sessions
    set status    = 'planned',
        updated_at = now()
    where id = v_session_id;
  end if;

  return null;
end;
$function$
;

grant delete on table "public"."exercises" to "anon";

grant insert on table "public"."exercises" to "anon";

grant references on table "public"."exercises" to "anon";

grant select on table "public"."exercises" to "anon";

grant trigger on table "public"."exercises" to "anon";

grant truncate on table "public"."exercises" to "anon";

grant update on table "public"."exercises" to "anon";

grant delete on table "public"."exercises" to "authenticated";

grant insert on table "public"."exercises" to "authenticated";

grant references on table "public"."exercises" to "authenticated";

grant select on table "public"."exercises" to "authenticated";

grant trigger on table "public"."exercises" to "authenticated";

grant truncate on table "public"."exercises" to "authenticated";

grant update on table "public"."exercises" to "authenticated";

grant delete on table "public"."exercises" to "service_role";

grant insert on table "public"."exercises" to "service_role";

grant references on table "public"."exercises" to "service_role";

grant select on table "public"."exercises" to "service_role";

grant trigger on table "public"."exercises" to "service_role";

grant truncate on table "public"."exercises" to "service_role";

grant update on table "public"."exercises" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."workout_session_exercises" to "anon";

grant insert on table "public"."workout_session_exercises" to "anon";

grant references on table "public"."workout_session_exercises" to "anon";

grant select on table "public"."workout_session_exercises" to "anon";

grant trigger on table "public"."workout_session_exercises" to "anon";

grant truncate on table "public"."workout_session_exercises" to "anon";

grant update on table "public"."workout_session_exercises" to "anon";

grant delete on table "public"."workout_session_exercises" to "authenticated";

grant insert on table "public"."workout_session_exercises" to "authenticated";

grant references on table "public"."workout_session_exercises" to "authenticated";

grant select on table "public"."workout_session_exercises" to "authenticated";

grant trigger on table "public"."workout_session_exercises" to "authenticated";

grant truncate on table "public"."workout_session_exercises" to "authenticated";

grant update on table "public"."workout_session_exercises" to "authenticated";

grant delete on table "public"."workout_session_exercises" to "service_role";

grant insert on table "public"."workout_session_exercises" to "service_role";

grant references on table "public"."workout_session_exercises" to "service_role";

grant select on table "public"."workout_session_exercises" to "service_role";

grant trigger on table "public"."workout_session_exercises" to "service_role";

grant truncate on table "public"."workout_session_exercises" to "service_role";

grant update on table "public"."workout_session_exercises" to "service_role";

grant delete on table "public"."workout_sessions" to "anon";

grant insert on table "public"."workout_sessions" to "anon";

grant references on table "public"."workout_sessions" to "anon";

grant select on table "public"."workout_sessions" to "anon";

grant trigger on table "public"."workout_sessions" to "anon";

grant truncate on table "public"."workout_sessions" to "anon";

grant update on table "public"."workout_sessions" to "anon";

grant delete on table "public"."workout_sessions" to "authenticated";

grant insert on table "public"."workout_sessions" to "authenticated";

grant references on table "public"."workout_sessions" to "authenticated";

grant select on table "public"."workout_sessions" to "authenticated";

grant trigger on table "public"."workout_sessions" to "authenticated";

grant truncate on table "public"."workout_sessions" to "authenticated";

grant update on table "public"."workout_sessions" to "authenticated";

grant delete on table "public"."workout_sessions" to "service_role";

grant insert on table "public"."workout_sessions" to "service_role";

grant references on table "public"."workout_sessions" to "service_role";

grant select on table "public"."workout_sessions" to "service_role";

grant trigger on table "public"."workout_sessions" to "service_role";

grant truncate on table "public"."workout_sessions" to "service_role";

grant update on table "public"."workout_sessions" to "service_role";

grant delete on table "public"."workout_sets" to "anon";

grant insert on table "public"."workout_sets" to "anon";

grant references on table "public"."workout_sets" to "anon";

grant select on table "public"."workout_sets" to "anon";

grant trigger on table "public"."workout_sets" to "anon";

grant truncate on table "public"."workout_sets" to "anon";

grant update on table "public"."workout_sets" to "anon";

grant delete on table "public"."workout_sets" to "authenticated";

grant insert on table "public"."workout_sets" to "authenticated";

grant references on table "public"."workout_sets" to "authenticated";

grant select on table "public"."workout_sets" to "authenticated";

grant trigger on table "public"."workout_sets" to "authenticated";

grant truncate on table "public"."workout_sets" to "authenticated";

grant update on table "public"."workout_sets" to "authenticated";

grant delete on table "public"."workout_sets" to "service_role";

grant insert on table "public"."workout_sets" to "service_role";

grant references on table "public"."workout_sets" to "service_role";

grant select on table "public"."workout_sets" to "service_role";

grant trigger on table "public"."workout_sets" to "service_role";

grant truncate on table "public"."workout_sets" to "service_role";

grant update on table "public"."workout_sets" to "service_role";

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workout_session_exercises FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workout_sets FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_update_workout_status_from_sets AFTER INSERT OR DELETE OR UPDATE ON public.workout_sets FOR EACH ROW EXECUTE FUNCTION update_workout_status_from_sets();


