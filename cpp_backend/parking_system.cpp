#include <iostream>
#include <vector>
#include <ctime>
#include <iomanip>
using namespace std;

enum VehicleType { BIKE, CAR, TRUCK };

string typeToString(VehicleType type) {
    if (type == BIKE) return "BIKE";
    if (type == CAR) return "CAR";
    return "TRUCK";
}

class Vehicle {
public:
    string plate;
    VehicleType type;
    time_t entryTime;

    Vehicle(string p, VehicleType t) {
        plate = p;
        type = t;
        entryTime = time(0);
    }
};

class Slot {
public:
    int id;
    int level;
    VehicleType type;
    Vehicle* occupiedBy;

    Slot(int i, int l, VehicleType t) {
        id = i;
        level = l;
        type = t;
        occupiedBy = nullptr;
    }

    bool isAvailable() {
        return occupiedBy == nullptr;
    }
};

class ParkingSystem {
private:
    vector<Slot> slots;
    float bikeRate = 20;
    float carRate = 50;
    float truckRate = 80;

public:
    ParkingSystem() {
        // 36 slots (18 per level)
        for (int i = 1; i <= 36; i++) {
            int level = (i <= 18) ? 1 : 2;
            VehicleType type;

            if (i % 3 == 0) type = CAR;
            else if (i % 3 == 1) type = BIKE;
            else type = TRUCK;

            slots.push_back(Slot(i, level, type));
        }
    }

    void parkVehicle(string plate, VehicleType type, int level) {
        for (auto &slot : slots) {
            if (slot.level == level && slot.type == type && slot.isAvailable()) {
                slot.occupiedBy = new Vehicle(plate, type);
                cout << "✅ Vehicle parked at Slot " << slot.id << endl;
                return;
            }
        }
        cout << "❌ No available slot for this vehicle type on this level.\n";
    }

    void releaseVehicle(int slotId) {
        for (auto &slot : slots) {
            if (slot.id == slotId && slot.occupiedBy != nullptr) {
                time_t exitTime = time(0);
                double hours = difftime(exitTime, slot.occupiedBy->entryTime) / 3600.0;

                float rate = 0;
                if (slot.occupiedBy->type == BIKE) rate = bikeRate;
                else if (slot.occupiedBy->type == CAR) rate = carRate;
                else rate = truckRate;

                float amount = hours * rate;

                cout << fixed << setprecision(2);
                cout << "💰 Bill: ₹" << amount << " (" << hours << " hrs)\n";

                delete slot.occupiedBy;
                slot.occupiedBy = nullptr;

                cout << "🚗 Slot " << slotId << " is now free.\n";
                return;
            }
        }
        cout << "❌ Invalid slot or already empty.\n";
    }

    void displayStatus() {
        cout << "\n--- Parking Status ---\n";
        for (auto &slot : slots) {
            cout << "Slot " << slot.id << " (L" << slot.level << ", "
                 << typeToString(slot.type) << ") : ";

            if (slot.occupiedBy)
                cout << "Occupied by " << slot.occupiedBy->plate;
            else
                cout << "Empty";

            cout << endl;
        }
    }
};

int main() {
    ParkingSystem ps;

    int choice;
    while (true) {
        cout << "\n===== PARKING SYSTEM =====\n";
        cout << "1. Park Vehicle\n";
        cout << "2. Release Vehicle\n";
        cout << "3. Display Status\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        if (choice == 1) {
            string plate;
            int type, level;

            cout << "Enter plate: ";
            cin >> plate;

            cout << "Type (0=BIKE,1=CAR,2=TRUCK): ";
            cin >> type;

            cout << "Level (1 or 2): ";
            cin >> level;

            ps.parkVehicle(plate, (VehicleType)type, level);
        }
        else if (choice == 2) {
            int id;
            cout << "Enter slot ID: ";
            cin >> id;
            ps.releaseVehicle(id);
        }
        else if (choice == 3) {
            ps.displayStatus();
        }
        else if (choice == 4) {
            break;
        }
        else {
            cout << "Invalid choice.\n";
        }
    }

    return 0;
}
