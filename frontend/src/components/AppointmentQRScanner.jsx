import { useState } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Camera, 
  Check, 
  Play,
  CheckCircle,
  User,
  Scissors,
  Clock,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const AppointmentQRScanner = ({ salonId, onScanComplete }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedAction, setSelectedAction] = useState("confirm");

  const actions = [
    { value: "confirm", label: "Confirmer arrivee", icon: Check, color: "bg-green-600" },
    { value: "start", label: "Commencer coupe", icon: Play, color: "bg-blue-600" },
    { value: "complete", label: "Terminer coupe", icon: CheckCircle, color: "bg-purple-600" }
  ];

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Veuillez entrer le code QR");
      return;
    }

    setScanning(true);
    try {
      const response = await axios.post(`${API}/appointments/scan-qr`, {
        qr_code: qrInput,
        action: selectedAction
      }, { withCredentials: true });

      setScanResult(response.data);
      toast.success(response.data.message);

      if (onScanComplete) {
        onScanComplete(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du scan");
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setQrInput("");
    setScanResult(null);
    setSelectedAction("confirm");
  };

  return (
    <>
      <Button
        onClick={() => setShowScanner(true)}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        data-testid="open-qr-scanner-btn"
      >
        <QrCode className="w-5 h-5 mr-2" />
        Scanner RDV
      </Button>

      <Dialog open={showScanner} onOpenChange={(open) => { setShowScanner(open); if (!open) resetScanner(); }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6 text-green-400" />
              Scanner QR Code RDV
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!scanResult ? (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 space-y-6"
              >
                {/* Action Selection */}
                <div>
                  <label className="text-slate-300 text-sm mb-3 block">Action a effectuer</label>
                  <div className="grid grid-cols-3 gap-2">
                    {actions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => setSelectedAction(action.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedAction === action.value
                            ? `${action.color} border-white text-white`
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500"
                        }`}
                        data-testid={`action-${action.value}`}
                      >
                        <action.icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Input */}
                <div className="space-y-3">
                  <label className="text-slate-300 text-sm">Code QR du client</label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="AFROCROWN:apt_..."
                      className="bg-slate-700 border-slate-600 text-white pl-11"
                      data-testid="qr-input"
                    />
                  </div>
                  <p className="text-slate-500 text-xs">
                    Scannez ou entrez manuellement le code QR du rendez-vous
                  </p>
                </div>

                <Button
                  onClick={handleScan}
                  disabled={scanning || !qrInput.trim()}
                  className={`w-full ${actions.find(a => a.value === selectedAction)?.color || "bg-green-600"}`}
                  data-testid="scan-qr-btn"
                >
                  {scanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Verification...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {actions.find(a => a.value === selectedAction)?.label}
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`w-20 h-20 ${actions.find(a => a.value === selectedAction)?.color || "bg-green-600"} rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {scanResult.message}
                  </h3>

                  <div className="bg-slate-700 rounded-xl p-4 mt-4 text-left space-y-3">
                    {scanResult.appointment?.client_photo && (
                      <div className="flex justify-center mb-4">
                        <img 
                          src={scanResult.appointment.client_photo}
                          alt="Client"
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Client</p>
                        <p className="text-white font-medium">{scanResult.appointment?.client_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Scissors className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Coupe</p>
                        <p className="text-white font-medium">{scanResult.appointment?.haircut_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-slate-400 text-xs">Horaire</p>
                        <p className="text-white font-medium">{scanResult.appointment?.date} a {scanResult.appointment?.time}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-600">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        scanResult.appointment?.status === "completed" ? "bg-purple-600/20 text-purple-400" :
                        scanResult.appointment?.status === "in_progress" ? "bg-blue-600/20 text-blue-400" :
                        "bg-green-600/20 text-green-400"
                      }`}>
                        {scanResult.appointment?.status === "completed" ? "Termine" :
                         scanResult.appointment?.status === "in_progress" ? "En cours" :
                         "Confirme"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={resetScanner}
                  className="w-full mt-6 bg-slate-700 hover:bg-slate-600"
                  data-testid="scan-another-btn"
                >
                  Scanner un autre RDV
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentQRScanner;
