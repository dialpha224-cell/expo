import { useState } from "react";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Camera, 
  Check, 
  Gift,
  User,
  Sparkles,
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

const LoyaltyScanner = ({ salonId, onScanComplete }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async () => {
    if (!qrInput.trim()) {
      toast.error("Veuillez entrer le code QR");
      return;
    }

    setScanning(true);
    try {
      const response = await axios.post(`${API}/loyalty/scan`, {
        qr_code_data: qrInput
      }, { withCredentials: true });

      setScanResult(response.data);
      
      if (response.data.reward_earned) {
        toast.success(`Felicitations ! ${response.data.client_name} a gagne une recompense !`);
      } else {
        toast.success(`Tampon ajoute pour ${response.data.client_name} !`);
      }

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
  };

  return (
    <>
      <Button
        onClick={() => setShowScanner(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
        data-testid="open-loyalty-scanner-btn"
      >
        <QrCode className="w-5 h-5 mr-2" />
        Scanner Fidelite
      </Button>

      <Dialog open={showScanner} onOpenChange={(open) => { setShowScanner(open); if (!open) resetScanner(); }}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-indigo-400" />
              Scanner Carte Fidelite
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
                <div className="text-center">
                  <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 text-sm">
                    Entrez le code QR du client ou scannez-le avec un lecteur.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-slate-300 text-sm">Code QR</label>
                  <Input
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    placeholder="AFROCROWN_LOYALTY:..."
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="qr-input"
                  />
                  <p className="text-slate-500 text-xs">
                    Le code commence par "AFROCROWN_LOYALTY:"
                  </p>
                </div>

                <Button
                  onClick={handleScan}
                  disabled={scanning || !qrInput.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
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
                      Valider le tampon
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
                {scanResult.reward_earned ? (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Recompense Gagnee !
                    </h3>
                    <p className="text-amber-400 font-medium text-lg mb-4">
                      {scanResult.reward_description}
                    </p>
                    <div className="bg-slate-700 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-center gap-2 text-slate-300">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{scanResult.client_name}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Tampon Ajoute !
                    </h3>
                    <div className="bg-slate-700 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
                        <User className="w-5 h-5" />
                        <span className="font-medium">{scanResult.client_name}</span>
                      </div>
                      <div className="text-indigo-400 font-bold text-xl">
                        {scanResult.stamps} / {scanResult.max_stamps}
                      </div>
                      <div className="mt-2 grid grid-cols-10 gap-1">
                        {Array.from({ length: scanResult.max_stamps }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 rounded-full ${
                              i < scanResult.stamps ? "bg-indigo-500" : "bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Plus que {scanResult.max_stamps - scanResult.stamps} coupe{scanResult.max_stamps - scanResult.stamps > 1 ? "s" : ""} pour la recompense !
                    </p>
                  </div>
                )}

                <Button
                  onClick={resetScanner}
                  className="w-full mt-6 bg-slate-700 hover:bg-slate-600"
                  data-testid="scan-another-btn"
                >
                  Scanner un autre client
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoyaltyScanner;
