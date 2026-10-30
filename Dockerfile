
# 1. Build React frontend
FROM oven/bun:1 AS frontend
WORKDIR /app/client

COPY client/package.json client/bun.lock ./
RUN bun install --frozen-lockfile

COPY client/ ./
RUN bun run build

# 2. Build C# backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /app

COPY server/SIVMP2.Api/SIVMP2.Api.csproj server/SIVMP2.Api/
RUN dotnet restore server/SIVMP2.Api/SIVMP2.Api.csproj

COPY server/ server/

COPY --from=frontend /app/client/dist/ server/SIVMP2.Api/wwwroot/

RUN dotnet publish server/SIVMP2.Api/SIVMP2.Api.csproj \
    -c Release -o /app/publish --no-restore

# 3. Final runtime container
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=backend /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SIVMP2.Api.dll"]
