# CryptoApp Data Flow

The application should keep market data, loading state, and error state separate so a failed request does not erase the last useful result.

## Request lifecycle
1. Start the request and mark the view as loading.
2. Validate the response before rendering values.
3. Store normalized coin data for the UI.
4. Clear the loading state in both success and failure paths.
5. Surface a recoverable error when the network request fails.

## Formatting
Prices and percentage changes should be formatted at the presentation boundary so raw API values remain suitable for sorting and calculations.
