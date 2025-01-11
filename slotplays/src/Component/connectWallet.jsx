export const connectWallet = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        return response.publicKey.toString();
      } else {
        alert("Phantom wallet not found! Please install it.");
        return null;
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      return null;
    }
  };