-- Trigger functions must not be reachable as /rest/v1/rpc endpoints.
-- Triggers still fire because EXECUTE is only checked at CREATE TRIGGER time.
revoke execute on function
  public.snap_profile_location(),
  public.create_match_on_mutual_like(),
  public.touch_match_last_message()
  from public, anon, authenticated;
