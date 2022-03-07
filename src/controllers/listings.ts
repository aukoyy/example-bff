import { Request, Response, NextFunction } from 'express';
import { Client } from 'pg';

enum CURRENCY {
	USD = 'USD',
	NOK = 'NOK',
}

interface Listing {
	id: number;
	title: string;
	caption: string;
	size: string;
	category: string;
	askingPrice: number;
	currency: CURRENCY;
	owner: string;
	sold: boolean;
}

const listings = require('../listings.json');

/* Database */
const client = new Client({
	user: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: 'postgres',
	port: 5432,
});
client.connect();

client.query('SELECT NOW() as now', (err, res) => {
	if (err) {
		console.log(err.stack);
	} else {
		console.log(res.rows[0]);
	}
});

/* Endpoints */
const getListings = async (req: Request, res: Response) => {
	client.query('SELECT * from tise."Listings"', (err, pgres) => {
		if (err) {
			console.log(err.stack);
			return res.status(400).json({ message: 'Bad request' });
		} else {
			const response = pgres.rows;
			console.log(response);
			return res.status(200).json(response);
		}
	});
};

const getListing = async (req: Request, res: Response, next: NextFunction) => {
	let id: string = req.params.id;
	client.query(`SELECT * from tise."Listings" where id=${id}`, (err, pgres) => {
		if (err) {
			return res.status(400).json({ message: 'Bad request' });
		} else {
			const response = pgres.rows;
			return res.status(200).json(response[0]);
		}
	});
};

const addListing = async (req: Request, res: Response) => {
	const title: string = req.body.title;
	const caption: string = req.body.caption ?? null;
	const size: number = req.body.size ?? null;
	const category: string = req.body.category ?? null; // TODO: category should be one of categories.json
	const askingPrice: number = req.body.askingPrice ?? null;
	const currency: string = req.body.currency ?? null;
	const owner: string = req.body.owner ?? null;
	const sold: boolean = false;
	// TODO: deconstruct

	client.query(
		`
    INSERT INTO tise."Listings"(title, caption, size, category, asking_price, currency, owner, sold)
    VALUES ('${title}', '${caption}', ${size}, '${category}', ${askingPrice}, '${currency}', '${owner}', ${sold})
  `,
		(err, pgres) => {
			if (err) {
				console.log(err);
				return res.status(400).json({ message: 'Bad request' });
			} else {
				return res.status(201).json({ message: 'Created' });
			}
		}
	);
};

const likeListing = async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const likedBy: string = req.body.likedBy;
	// const { likedBy } = req.body

	let likeList: string[] = ['empty'];
	client.query(
		`SELECT liked_by from tise."Listings" WHERE id=${id}`,
		(err, pgres) => {
			if (err) {
				console.log(err.stack);
				return res.status(400).json({ message: 'Bad request' });
			} else {
				const existingLikers = pgres.rows[0].liked_by;
				console.log(existingLikers);
				likeList = existingLikers;
				console.log(likeList);

				/* client.query(
		`
    UPDATE tise."Listings" 
    SET liked_by = '{${likeList}}' 
    WHERE id=${id}
  `,
		(err, pgres) => {
			if (err) {
				console.log(err);
				return res.status(400).json({ message: 'Bad request' });
			} else {
				// const response = pgres;

				return res.status(204).json({ message: 'Updated' });
			}
		}
	); */
			}
		}
	);

	return res.status(200).json({ likeList });
};

// TODO: implement
const searchListing = async (req: Request, res: Response) => {
	client.query('SELECT * from tise."Listings"', (err, pgres) => {
		if (err) {
			console.log(err.stack);
			return res.status(400).json({ message: 'Bad request' });
		} else {
			const response = pgres.rows;
			console.log(response);
			return res.status(200).json(response);
		}
	});
};

export default {
	getListings,
	getListing,
	likeListing,
	addListing,
	searchListing,
};
