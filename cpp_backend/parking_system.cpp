#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <algorithm>
#include <ctime>

// --- VEHICLE CLASSES ---
enum class VehicleType {
    CAR,
    BIKE,
    TRUCK
};

class Vehicle {
protected:
    std::string licensePlate;
    VehicleType type;
    std::time_t entryTime;

public:
    Vehicle(std::string lp, VehicleType t) : licensePlate(lp), type(t) {
        entryTime = std::time(nullptr);
    }
    virtual ~Vehicle() {}

    virtual std::string getTypeName() const = 0;
    std::string getLicensePlate() const { return licensePlate; }
    VehicleType getType() const { return type; }
    std::time_t getEntryTime() const { return entryTime; }
};

class Car : public Vehicle {
public:
    Car(std::string lp) : Vehicle(lp, VehicleType::CAR) {}
    std::string getTypeName() const override { return "Car"; }
};

class Bike : public Vehicle {
public:
    Bike(std::string lp) : Vehicle(lp, VehicleType::BIKE) {}
    std::string getTypeName() const override { return "Motorcycle"; }
};

class Truck : public Vehicle {
public:
    Truck(std::string lp) : Vehicle(lp, VehicleType::TRUCK) {}
    std::string getTypeName() const override { return "Truck"; }
};

// --- PARKING SLOT CLASS ---
class ParkingSlot {
private:
    int slotNumber;
    int level;
    bool isOccupied;
    VehicleType supportedType;
    std::shared_ptr<Vehicle> occupiedBy;

public:
    ParkingSlot(int number, int lvl, VehicleType type) 
        : slotNumber(number), level(lvl), isOccupied(false), supportedType(type), occupiedBy(nullptr) {}

    int getSlotNumber() const { return slotNumber; }
    int getLevel() const { return level; }
    bool getIsOccupied() const { return isOccupied; }
    VehicleType getSupportedType() const { return supportedType; }
    
    bool parkVehicle(std::shared_ptr<Vehicle> v) {
        if (!isOccupied && v->getType() == supportedType) {
            occupiedBy = v;
            isOccupied = true;
            return true;
        }
        return false;
    }

    void release() {
        occupiedBy = nullptr;
        isOccupied = false;
    }

    std::shared_ptr<Vehicle> getVehicle() const {
        return occupiedBy;
    }
};

// --- PARKING LOT CLASS ---
class ParkingLot {
private:
    std::vector<std::unique_ptr<ParkingSlot>> slots;

public:
    ParkingLot() {
        int id = 1;
        // Level 1: 10 Bikes, 10 Cars
        for (int i = 0; i < 10; ++i) slots.push_back(std::make_unique<ParkingSlot>(id++, 1, VehicleType::BIKE));
        for (int i = 0; i < 10; ++i) slots.push_back(std::make_unique<ParkingSlot>(id++, 1, VehicleType::CAR));
        
        // Level 2: 10 Cars, 6 Trucks
        for (int i = 0; i < 10; ++i) slots.push_back(std::make_unique<ParkingSlot>(id++, 2, VehicleType::CAR));
        for (int i = 0; i < 6; ++i) slots.push_back(std::make_unique<ParkingSlot>(id++, 2, VehicleType::TRUCK));
    }

    double getPricePerHour(VehicleType type) {
        switch(type) {
            case VehicleType::BIKE: return 2.00;
            case VehicleType::CAR: return 5.00;
            case VehicleType::TRUCK: return 10.00;
            default: return 0.0;
        }
    }

    bool park(std::shared_ptr<Vehicle> v) {
        for (auto& slot : slots) {
            if (!slot->getIsOccupied() && slot->getSupportedType() == v->getType()) {
                return slot->parkVehicle(v);
            }
        }
        return false;
    }

    double calculateFee(std::shared_ptr<Vehicle> v) {
        std::time_t now = std::time(nullptr);
        double seconds = std::difftime(now, v->getEntryTime());
        int hours = (int)(seconds / 3600) + 1; // Minimum 1 hour
        return hours * getPricePerHour(v->getType());
    }

    bool leave(int slotNumber) {
        for (auto& slot : slots) {
            if (slot->getSlotNumber() == slotNumber) {
                if (slot->getIsOccupied()) {
                    double fee = calculateFee(slot->getVehicle());
                    std::cout << "Transaction Finished. Fee for " << slot->getVehicle()->getLicensePlate() << ": $" << fee << std::endl;
                }
                slot->release();
                return true;
            }
        }
        return false;
    }

    const std::vector<std::unique_ptr<ParkingSlot>>& getSlots() const {
        return slots;
    }
};

// --- MAIN INTERFACE (FOR SYSTEM INTEGRATION) ---
int main() {
    std::cout << "Parking Management System C++ Backend (v2.0)" << std::endl;
    std::cout << "--------------------------------------------" << std::endl;

    ParkingLot myLot;

    auto testBike = std::make_shared<Bike>("MH-12-CZ-4567");
    auto testTruck = std::make_shared<Truck>("HR-55-XY-8888");

    if (myLot.park(testBike)) {
        std::cout << "BIKE Parked Successfully on Level 1" << std::endl;
    }

    if (myLot.park(testTruck)) {
        std::cout << "TRUCK Parked Successfully on Level 2" << std::endl;
    }

    myLot.leave(1); // Releasing first slot (Bike)

    return 0;
}
