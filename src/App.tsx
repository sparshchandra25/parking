
import React, { useState, useEffect } from "react";

type VehicleType = "CAR" | "BIKE" | "TRUCK";

interface Vehicle {
  plate: string;
  type: VehicleType;
  entryTime: number;
}

interface Slot {
  id: number;
  level: 1 | 2;
  type: VehicleType;
  occupiedBy: Vehicle | null;
}

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [currentLevel, setCurrentLevel] = useState<1 | 2>(1);
  const [showModal, setShowModal] = useState(false);
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<VehicleType>("CAR");

  // INIT DATA
  useEffect(() => {
    const data: Slot[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      level: i < 6 ? 1 : 2,
      type: i % 3 === 0 ? "CAR" : i % 3 === 1 ? "BIKE" : "TRUCK",
      occupiedBy: null,
    }));

    setSlots(data);
  }, []);

  // PARK
  const handlePark = () => {
    const empty = slots.find(
      (s) => !s.occupiedBy && s.level === currentLevel && s.type === type
    );

    if (!empty) return alert("No slot available");

    setSlots(
      slots.map((s) =>
        s.id === empty.id
          ? {
              ...s,
              occupiedBy: { plate, type, entryTime: Date.now() },
            }
          : s
      )
    );

    setPlate("");
    setShowModal(false);
  };

  // RELEASE
  const handleRelease = (id: number) => {
    setSlots(
      slots.map((s) =>
        s.id === id ? { ...s, occupiedBy: null } : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Parking System</h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setCurrentLevel(1)}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          L1
        </button>
        <button
          onClick={() => setCurrentLevel(2)}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          L2
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Park Vehicle
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {slots
          .filter((s) => s.level === currentLevel)
          .map((slot) => (
            <div
              key={slot.id}
              className="border p-4 rounded bg-gray-800"
            >
              <p>Slot {slot.id}</p>
              <p>{slot.type}</p>

              {slot.occupiedBy ? (
                <>
                  <p>{slot.occupiedBy.plate}</p>
                  <button
                    onClick={() => handleRelease(slot.id)}
                    className="bg-red-500 px-2 py-1 mt-2"
                  >
                    Release
                  </button>
                </>
              ) : (
                <p>Empty</p>
              )}
            </div>
          ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded">
            <input
              placeholder="Plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="p-2 mb-3 w-full text-black"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value as VehicleType)}
              className="p-2 mb-3 w-full text-black"
            >
              <option value="CAR">CAR</option>
              <option value="BIKE">BIKE</option>
              <option value="TRUCK">TRUCK</option>
            </select>

            <button
              onClick={handlePark}
              className="bg-green-500 px-4 py-2"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}