from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration. Override via environment or a .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="HABITIQ_")

    # SQLite by default for local dev; set to a postgresql+psycopg2 URL in prod.
    database_url: str = "sqlite:///./habitiq.db"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["*"]


settings = Settings()
