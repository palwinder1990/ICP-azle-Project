// cannister code goes here
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';

interface Rental {
    id: string;
    tenant: string;
    propertyId: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const rentalsStorage = StableBTreeMap<string, Rental>(0);

export default Server(() => {
    const app = express();
    app.use(express.json());

    app.post("/rentals", (req, res) => {
        const { tenant, propertyId, startDate, endDate } = req.body;
        const id = uuidv4();
        const newRental: Rental = { id, tenant, propertyId, startDate, endDate, isActive: true };
        rentalsStorage.insert(id, newRental);
        res.json(newRental);
    });

    app.get("/rentals", (req, res) => {
        res.json(rentalsStorage.values());
    });

    app.get("/rentals/:id", (req, res) => {
        const rentalId = req.params.id;
        const rentalOpt = rentalsStorage.get(rentalId);
        if ("None" in rentalOpt) {
            res.status(404).send(`Rental with id ${rentalId} not found.`);
        } else {
            res.json(rentalOpt.Some);
        }
    });

    app.put("/rentals/:id", (req, res) => {
        const rentalId = req.params.id;
        const rentalOpt = rentalsStorage.get(rentalId);
        if ("None" in rentalOpt) {
            res.status(400).send(`Couldn't update rental with id ${rentalId}. Rental not found.`);
        } else {
            const rental = rentalOpt.Some;
            const updatedRental = { ...rental, ...req.body };
            rentalsStorage.insert(rental.id, updatedRental);
            res.json(updatedRental);
        }
    });

    app.delete("/rentals/:id", (req, res) => {
        const rentalId = req.params.id;
        const deletedRental = rentalsStorage.remove(rentalId);
        if ("None" in deletedRental) {
            res.status(400).send(`Couldn't delete rental with id ${rentalId}. Rental not found.`);
        } else {
            res.json(deletedRental.Some);
        }
    });

    return app.listen();
});