"""HTTP clients provider for dependency injection."""

from collections.abc import AsyncIterator

import httpx
from dishka import Provider, Scope, provide

from app.clients.example_service import ExampleServiceClient
from app.clients.facebook import FacebookClient
from app.settings import Config


class HttpClientsProvider(Provider):
    """Provider for HTTP clients and external service integrations.

    This provider manages the lifecycle of httpx.AsyncClient and provides
    HTTP clients for external services with proper dependency injection.

    Key features:
    - Single httpx.AsyncClient instance per APP scope (connection pooling)
    - Automatic client cleanup on application shutdown
    - Easy integration with custom service clients
    - Configuration injection from Config

    Usage:
        Add this provider to your IoC container in ioc.py:

        def get_async_container() -> AsyncContainer:
            return make_async_container(
                AppProvider(),
                ServicesProvider(),
                HttpClientsProvider(),  # Add this
            )
    """

    @provide(scope=Scope.APP)
    async def get_httpx_client(self) -> AsyncIterator[httpx.AsyncClient]:
        """Provide httpx AsyncClient with connection pooling.

        Scope: APP - single instance for the entire application lifecycle.
        This enables connection pooling and resource reuse.

        Default configuration:
        - timeout: 30 seconds
        - connection limits: 100 total, 20 per host
        - http2: enabled
        - follow_redirects: enabled

        :return: Configured httpx AsyncClient instance
        """
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            http2=True,
            follow_redirects=True,
        ) as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_example_service_client(
        self,
        client: httpx.AsyncClient,
        config: Config,
    ) -> ExampleServiceClient:
        """Provide Example Service HTTP client.

        Scope: REQUEST - new instance per request.
        This is appropriate for most HTTP clients as they are lightweight
        wrappers around the shared httpx.AsyncClient.

        :param client: Shared httpx AsyncClient (APP scope)
        :param config: Application configuration (APP scope)
        :return: Configured ExampleServiceClient instance
        """
        return ExampleServiceClient(client, config)

    @provide(scope=Scope.REQUEST)
    def get_facebook_client(
        self,
        client: httpx.AsyncClient,
        config: Config,
    ) -> FacebookClient:
        """Provide Facebook Graph API client."""
        return FacebookClient(client, config.facebook)
