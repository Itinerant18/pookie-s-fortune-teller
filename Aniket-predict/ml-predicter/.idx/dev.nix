{ pkgs, ... }:
let
  # Define a Python environment with all the necessary packages
  python-with-packages = pkgs.python311.withPackages (ps: with ps; [
    # Packages from requirements.txt
    fastapi
    uvicorn
    pydantic
    sqlalchemy
    asyncpg
    redis
    pandas
    numpy
    scikit-learn
    statsmodels
    scipy
    requests
    python-dotenv

    # Packages from requirements-dev.txt
    pytest
    pytest-asyncio
    pytest-cov
    httpx
    black
    flake8
    mypy
  ]);
in
{
  # Nix channel to use.
  channel = "stable-24.05";

  # Packages to install.
  packages = [
    python-with-packages # This provides python, pip, and all the packages above
    pkgs.postgresql      # For psql command-line client
    pkgs.redis           # For redis-server and redis-cli
  ];

  # VS Code extensions to install.
  idx.extensions = [
    "ms-python.python"
    "google.gemini-cli-vscode-ide-companion"
  ];

  # Workspace lifecycle hooks.
  idx.workspace = {
    # No longer need to install dependencies on creation, Nix handles it.
    onCreate = {};
    # On workspace start.
    onStart = {
      # Start the Redis server in the background.
      start-redis = "redis-server & disown";
    };
  };

  # Web previews.
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = ["uvicorn" "src.main:app" "--host" "0.0.0.0" "--port" "$PORT" "--reload"];
        manager = "web";
      };
    };
  };
}
