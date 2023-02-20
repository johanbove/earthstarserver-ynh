import { createServer } from "http";
import { Replica, setGlobalCryptoDriver } from "earthstar";
import {
  CryptoDriverChloride,
  ExtensionKnownShares,
  ExtensionSyncWeb,
  AttachmentDriverFilesystem,
  Server,
} from "earthstar/node";

// Use the fastest crypto drive available for Node.
setGlobalCryptoDriver(CryptoDriverChloride);

// Create underlying HTTP server to be used by Earthstar server.
const nodeServer = createServer();

new Server(
  [
    new ExtensionKnownShares({
      // Populate with shares from the a known shares list.
      knownSharesPath: "known_shares.json",
      onCreateReplica: (shareAddress) => {
        return new Replica({
          driver: {
            docDriver: new Earthstar.DocDriverSqliteFfi({
              share: shareAddress,
              filename: `./data/${shareAddress}.sql`,
              mode: "create-or-open",
            }),
            attachmentDriver: new AttachmentDriverFilesystem(
              `./data/${shareAddress}_attachments`
            ),
          },
        });
      },
    }),
    new ExtensionSyncWeb({ server: nodeServer, path: "/sync" }),
  ],
  { port: __PORT__, server: nodeServer }
);

console.log('LISTENING ON PORT __PORT__');