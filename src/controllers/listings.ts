import { Request, Response, NextFunction } from 'express';
import { Client } from 'pg';
import { filterListingsBySearchQuery, isCategory } from '../utils';

enum CURRENCY {
	USD = 'USD',
	NOK = 'NOK',
}

export interface Listing {
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
			const response: Listing = pgres.rows[0];
			return res.status(200).json(response);
		}
	});
};

const addListing = async (req: Request, res: Response) => {
	const title: string = req.body.title;
	const caption: string = req.body.caption ?? null;
	const size: number = req.body.size ?? null;
	const category: string = req.body.category ?? null;
	const askingPrice: number = req.body.askingPrice ?? null;
	const currency: string = req.body.currency ?? null;
	const owner: string = req.body.owner ?? null;
	const sold: boolean = false;
	// TODO: deconstruct

	if (!isCategory(category)) {
		return res
			.status(404)
			.json({ message: `${category} is not a valid category` });
	}

	client.query(
		`
    INSERT INTO tise."Listings"(title, caption, size, category, asking_price, currency, owner, sold, liked_by)
    VALUES ('${title}', '${caption}', ${size}, '${category}', ${askingPrice}, '${currency}', '${owner}', ${sold}, array[]::varchar[])
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
	const { likedBy } = req.body;

	client.query(
		`SELECT liked_by from tise."Listings" WHERE id=${id}`,
		(err, pgres) => {
			if (err) {
				console.log(err.stack);
				return res.status(400).json({ message: 'Bad request' });
			} else {
				const existingLikers = pgres.rows[0].liked_by;
				const likeList = existingLikers.concat(likedBy);

				client.query(
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
							return res.status(201).json({ likeList });
						}
					}
				);
			}
		}
	);
};

const searchListing = async (req: Request, res: Response) => {
	const searchQuery: string = req.params.searchQuery;
	console.log(searchQuery);

	// return res.status(200).json({ searchQuery });

	// helper function: return listings with matching/partial
	// matching of query to title, category or caption
	client.query('SELECT * from tise."Listings"', (err, pgres) => {
		if (err) {
			console.log(err.stack);
			return res.status(400).json({ message: 'Bad request' });
		} else {
			const listings = pgres.rows;
			const filteredListings = filterListingsBySearchQuery(
				listings,
				searchQuery
			);
			return res.status(200).json(filteredListings);
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
