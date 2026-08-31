# CryptoApp Error Handling

## Network failures
A market-data request can fail because of connectivity, rate limits, or an unavailable API. The interface should keep the last valid dataset visible when possible and show a clear retry action.

## Invalid responses
Do not assume every response contains the expected fields. Missing prices, symbols, or percentage values should be handled before formatting or sorting.

## Retry behavior
Retries should be user-controlled or bounded. Repeated automatic requests should not create an uncontrolled request loop.
