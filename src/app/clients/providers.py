from collections.abc import AsyncIterator
from importlib.util import find_spec

import httpx
from dishka import Provider, Scope, provide

from app.api.modules.telegram.services.client import TelegramClient
from app.clients.example_service import ExampleServiceClient
from app.clients.facebook import FacebookClient
from app.settings import Config

HTTP2_AVAILABLE = find_spec("h2") is not None


class HttpClientsProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_httpx_client(self) -> AsyncIterator[httpx.AsyncClient]:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            http2=HTTP2_AVAILABLE,
            follow_redirects=True,
        ) as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_example_service_client(
        self,
        client: httpx.AsyncClient,
        config: Config,
    ) -> ExampleServiceClient:
        return ExampleServiceClient(client, config)

    @provide(scope=Scope.REQUEST)
    def get_facebook_client(
        self,
        client: httpx.AsyncClient,
        config: Config,
    ) -> FacebookClient:
        return FacebookClient(client, config.facebook)

    @provide(scope=Scope.REQUEST)
    def get_telegram_client(
        self,
        client: httpx.AsyncClient,
        config: Config,
    ) -> TelegramClient:
        return TelegramClient(client, config.telegram)
