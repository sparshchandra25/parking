import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state (mimicking the C++ backend logic)
  interface Vehicle {
    plate: string;
    type: 'CAR' | 'BIKE' | 'TRUCK';
    entryTime: number;
  }

  interface Slot {
    id: number;
    level: 1 | 2;
    type: 'CAR' | 'BIKE' | 'TRUCK';
    occupiedBy: Vehicle | null;
  }

  const PRICES = {
    BIKE: 2.00,
    CAR: 5.00,
    TRUCK: 10.00
  };

  let slots: Slot[] = [
    // Level 1: Bikes and Cars
    ...Array.from({ length: 10 }, (_, i) => ({ id: i + 1, level: 1 as const, type: 'BIKE' as const, occupiedBy: null })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: i + 11, level: 1 as const, type: 'CAR' as const, occupiedBy: null })),
    // Level 2: Cars and Trucks
    ...Array.from({ length: 10 }, (_, i) => ({ id: i + 21, level: 2 as const, type: 'CAR' as const, occupiedBy: null })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: i + 31, level: 2 as const, type: 'TRUCK' as const, occupiedBy: null })),
  ];

  // API Routes
  app.get("/api/parking/status", (req, res) => {
    res.json({ slots, prices: PRICES });
  });

  app.post("/api/parking/park", (req, res) => {
    const { plate, type } = req.body;
    
    // Find available slot that matches the type
    // Level 1: BIKE, CAR
    // Level 2: CAR, TRUCK
    // The current state initialiazer handles this constraint by slot generation
    const availableSlot = slots.find(s => !s.occupiedBy && s.type === type);
    
    if (availableSlot) {
      availableSlot.occupiedBy = { plate, type, entryTime: Date.now() };
      res.json({ success: true, slotId: availableSlot.id, level: availableSlot.level });
    } else {
      res.status(400).json({ success: false, message: `No spots available for ${type}.` });
    }
  });

  app.post("/api/parking/release", (req, res) => {
    const { slotId } = req.body;
    const slot = slots.find(s => s.id === slotId);
    
    if (slot && slot.occupiedBy) {
      const startTime = slot.occupiedBy.entryTime;
      const endTime = Date.now();
      const durationHours = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60))); 
      const price = PRICES[slot.occupiedBy.type] * durationHours;
      
      const vehicle = slot.occupiedBy;
      slot.occupiedBy = null;
      res.json({ success: true, durationHours, price, vehicle });
    } else {
      res.status(400).json({ success: false, message: "Slot not found or already empty." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
