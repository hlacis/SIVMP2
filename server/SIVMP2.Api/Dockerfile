FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["server/SIVMP2.Api/SIVMP2.Api.csproj", "server/SIVMP2.Api/"]
RUN dotnet restore "server/SIVMP2.Api/SIVMP2.Api.csproj"
COPY . .
WORKDIR "/src/server/SIVMP2.Api"
RUN dotnet build "./SIVMP2.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SIVMP2.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SIVMP2.Api.dll"]
