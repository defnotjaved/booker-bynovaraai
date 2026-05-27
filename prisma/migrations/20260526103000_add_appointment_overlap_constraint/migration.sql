CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT appointment_no_overlap_active
EXCLUDE USING gist (
  "barberId" WITH =,
  tsrange(
    make_timestamp(
      substring("date" from 1 for 4)::integer,
      substring("date" from 6 for 2)::integer,
      substring("date" from 9 for 2)::integer,
      split_part("startTime", ':', 1)::integer,
      split_part("startTime", ':', 2)::integer,
      0
    ),
    make_timestamp(
      substring("date" from 1 for 4)::integer,
      substring("date" from 6 for 2)::integer,
      substring("date" from 9 for 2)::integer,
      split_part("endTime", ':', 1)::integer,
      split_part("endTime", ':', 2)::integer,
      0
    ),
    '[)'
  ) WITH &&
)
WHERE ("status" NOT IN ('cancelled', 'no_show'));
