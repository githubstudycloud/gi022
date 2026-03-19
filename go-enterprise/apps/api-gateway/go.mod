module github.com/your-org/go-enterprise/apps/api-gateway

go 1.22

require (
	github.com/gin-gonic/gin v1.10.0
	github.com/your-org/go-enterprise/libs/config v0.0.0
	github.com/your-org/go-enterprise/libs/logger v0.0.0
	github.com/your-org/go-enterprise/libs/errors v0.0.0
	github.com/your-org/go-enterprise/libs/tracing v0.0.0
	github.com/your-org/go-enterprise/libs/middleware v0.0.0
)

replace (
	github.com/your-org/go-enterprise/libs/config => ../../libs/config
	github.com/your-org/go-enterprise/libs/logger => ../../libs/logger
	github.com/your-org/go-enterprise/libs/errors => ../../libs/errors
	github.com/your-org/go-enterprise/libs/tracing => ../../libs/tracing
	github.com/your-org/go-enterprise/libs/middleware => ../../libs/middleware
)
