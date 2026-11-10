# ==============================================================================
# Dockerfile Multi-Stage Build: Rust Axum Backend
# SLA Tracker Smart City Kota Bandar Lampung (UTS PPSI 2026)
# ==============================================================================

# Stage 1: Build Crate
FROM rust:1.80-slim-bookworm AS builder
WORKDIR /app

# Install dependensi sistem untuk kompilasi
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Salin manifest dependensi untuk caching layer
COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "pub fn lib() {}" > src/lib.rs
RUN cargo build --release || true

# Salin seluruh source code & build binary produksi
COPY src ./src
RUN touch src/main.rs src/lib.rs
RUN cargo build --release --bin sla-server

# Stage 2: Runtime Minimalis
FROM debian:bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates libssl3 curl && rm -rf /var/lib/apt/lists/*

# Salin binary executable hasil build
COPY --from=builder /app/target/release/sla-server /usr/local/bin/sla-server

# Environment port
ENV PORT=8080
ENV RUST_LOG=info
EXPOSE 8080

CMD ["sla-server"]

