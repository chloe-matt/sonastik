defmodule SonastikEe.Repo do
  use Ecto.Repo,
    otp_app: :sonastik_ee,
    adapter: Ecto.Adapters.Postgres
end
