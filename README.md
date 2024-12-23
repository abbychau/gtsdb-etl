# Simple Tailer

A Node.js application that tails device log files and forwards specific data to a Time Series Database (TSDB).

## Features

- Monitors log files for specific gateway IDs
- Parses FBdevice log entries
- Forwards parsed data to TSDB in real-time
- Maintains persistent connection to TSDB

## Prerequisites

- Node.js
- Access to log files at `/var/www/haserver_v2/log/`
- Running TSDB instance on localhost:5555

## Installation

```bash
npm install
```

Required dependencies:
- carrier
- net (built-in)

## Usage

Start the tailer by providing a gateway ID:

```bash
node index.js <gwId>
```

The application will:
1. Connect to TSDB on localhost:5555
2. Monitor log files at `/var/www/haserver_v2/log/<gwId>/*.log`
3. Parse FBdevice entries and forward them to TSDB

## Log Format

Expected log entry format:
```
(gwId)|...|FBdevice|deviceId|groupId|...|value|...
```

## Data Format

Data is forwarded to TSDB in the following format:
```json
{
    "operation": "write",
    "Write": {
        "id": "gwId_deviceId_groupId",
        "Value": numericValue
    }
}
```
