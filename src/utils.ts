import { Listing } from './controllers/listings';

const categories = require('./categories.json');

export const isCategory = (category: string) => {
	if (categories.includes(category)) {
		return true;
	}
	return false;
};

export const filterListingsBySearchQuery = (
	listings: Listing[],
	searchQuery: string
) => {
	/* 
    Filter by:
      - title
      - category
      - caption
  */
	// console.log(listings);

	const lowerCaseSearchQuery = searchQuery.toLowerCase();

	const titleMatch = listings.filter((listing: Listing) => {
		return listing.title.toLocaleLowerCase().includes(lowerCaseSearchQuery);
	});
	const categoryMatch = listings.filter((listing: Listing) => {
		return listing.category.toLocaleLowerCase().includes(lowerCaseSearchQuery);
	});
	const captionMatch = listings.filter((listing: Listing) => {
		return listing.caption.toLocaleLowerCase().includes(lowerCaseSearchQuery);
	});

	// console.log(filteredListings);

	const filteredListings = titleMatch.concat(categoryMatch, captionMatch);

	return filteredListings;
};
