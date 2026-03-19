module github.com/your-org/go-enterprise/libs/middleware

go 1.22

require (
	github.com/gin-gonic/gin v1.10.0
	github.com/your-org/go-enterprise/libs/errors v0.0.0
	github.com/your-org/go-enterprise/libs/logger v0.0.0
	github.com/your-org/go-enterprise/libs/tracing v0.0.0
	go.opentelemetry.io/otel/trace v1.24.0
	golang.org/x/time v0.5.0
)

replace (
	github.com/your-org/go-enterprise/libs/errors => ../errors
	github.com/your-org/go-enterprise/libs/logger => ../logger
	github.com/your-org/go-enterprise/libs/tracing => ../tracing
)
