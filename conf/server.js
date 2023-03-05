import { createServer } from "http";
import { Replica, setGlobalCryptoDriver } from "earthstar";
import {
  CryptoDriverChloride,
  ExtensionKnownShares,
  ExtensionSyncWeb,
  AttachmentDriverFilesystem,
  Server,
  DocDriverSqlite
} from "earthstar/node";

// Use the fastest crypto drive available for Node.
setGlobalCryptoDriver(CryptoDriverChloride);

// Create underlying HTTP server to be used by Earthstar server.
const nodeServer = createServer();

new Server(
  [
    new ExtensionKnownShares({
      // Populate with shares from a known shares list.
      knownSharesPath: "known_shares.json",
      onCreateReplica: (shareAddress) => {
        console.log(`Replica starting for ${shareAddress}`);
        return new Replica({
          driver: {
            docDriver: new DocDriverSqlite({
              share: shareAddress,
              filename: `/home/yunohost.app/__APP__/${shareAddress}.sql`,
              mode: "create-or-open",
            }),
            attachmentDriver: new AttachmentDriverFilesystem(
              `/home/yunohost.app/__APP__/${shareAddress}_attachments`
            ),
          },
        });
      },
    }),
    new ExtensionSyncWeb({ server: nodeServer, path: "/sync" }),
  ],
  { port: __PORT__, server: nodeServer }
);

console.log('EARTHSTAR LISTENING ON PORT __PORT__');