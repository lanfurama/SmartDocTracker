import React from 'react';
import ScannerSimulator from '../ScannerSimulator';
import NotFoundModal from '../NotFoundModal';
import AuthModal from '../AuthModal';
import ProfileModal from '../ProfileModal';
import ActionModal from '../ActionModal';
import DataFlowLoader from '../DataFlowLoader';

interface AppModalsProps {
  showScanner: boolean;
  onScan: (code: string) => void;
  onCloseScanner: () => void;
  scanLoading: boolean;
  notFoundQR: string | null;
  onCreateNew: () => void;
  onScanAgain: () => void;
  onCloseNotFound: () => void;
  showAuthModal: boolean;
  onCloseAuthModal: () => void;
  showProfileModal: boolean;
  onCloseProfileModal: () => void;
  showActionModal: 'receive' | 'transfer' | 'return' | null;
  selectedDocId: string | null;
  note: string;
  onNoteChange: (v: string) => void;
  actionLoading: boolean;
  onActionConfirm: () => void;
  onActionCancel: () => void;
}

const AppModals: React.FC<AppModalsProps> = (props) => (
  <>
    {props.showScanner && <ScannerSimulator onScan={props.onScan} onClose={props.onCloseScanner} />}
    {props.scanLoading && <DataFlowLoader message="Đang tra cứu hồ sơ..." size="xl" overlay />}
    {props.notFoundQR && <NotFoundModal qrCode={props.notFoundQR} onCreateNew={props.onCreateNew} onScanAgain={props.onScanAgain} onClose={props.onCloseNotFound} />}
    {props.showAuthModal && <AuthModal onClose={props.onCloseAuthModal} />}
    {props.showProfileModal && <ProfileModal onClose={props.onCloseProfileModal} />}
    {props.showActionModal && props.selectedDocId && (
      <ActionModal type={props.showActionModal} docId={props.selectedDocId} note={props.note} onNoteChange={props.onNoteChange} loading={props.actionLoading} onConfirm={props.onActionConfirm} onCancel={props.onActionCancel} />
    )}
  </>
);

export default AppModals;
