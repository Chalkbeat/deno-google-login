Google Login for Deno
=====================

Authenticates and logs into the Sheets API using the same token as the NPR Dailygraphics rig. See test.js for examples in use.

Requires the following permissions:

  * ``--allow-net``: access the Google API
  * ``--allow-env``: pull your Google client ID and secret
  * ``--allow-write`` and ``--allow-read``: read and write your token file