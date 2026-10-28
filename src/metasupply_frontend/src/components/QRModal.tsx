import React from "react";
import Modal from "./Modal";
import QRCodeDisplay from "./QRCodeDisplay";
import { toQRPayload } from "../services/file";
import type { FileMetadata } from "../types";

const QRModal: React.FC<{ file: FileMetadata; onClose: () => void }> = ({ file, onClose }) => (
  <Modal title="QR Code for File" onClose={onClose}>
    <p className="text-center text-gray-600 mb-4 break-all">
      <span className="font-semibold">Filename:</span> {file.filename}
      <br />
      <span className="font-semibold">Version ID:</span> {file.id}
    </p>
    <QRCodeDisplay value={toQRPayload(file)} size={256} />
    <p className="text-sm text-gray-500 mt-4 text-center">Scan this QR code to get the file metadata.</p>
  </Modal>
);

export default QRModal;
