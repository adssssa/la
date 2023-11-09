import {Meta, createMutation, createQuery, createQueryWithId} from '../utils/api/hooks';
import {updateQueryCache} from '../utils/api/updateQueries';

export type Offer = {
    id: string;
    name: string;
    code: string;
    display_title: string;
    display_description: string;
    type: string;
    cadence: string;
    amount: number;
    duration: string;
    duration_in_months: number | null;
    currency_restriction: boolean;
    currency: string | null;
    status: string;
    redemption_count: number;
    tier: {
        id: string;
        name: string;
    }
}

export interface OffersResponseType {
    meta?: Meta
    offers: Offer[]
}

export interface OfferEditResponseType extends OffersResponseType {
    meta?: Meta
}

const dataType = 'OffersResponseType';

export const useBrowseOffers = createQuery<OffersResponseType>({
    dataType,
    path: '/offers/'
});

export const useBrowseOffersById = createQueryWithId<OffersResponseType>({
    dataType,
    path: `/offers/`
});

export const useEditOffer = createMutation<OfferEditResponseType, Offer>({
    method: 'PUT',
    path: offer => `/offers/${offer.id}/`,
    body: offer => ({offers: [offer]}),
    updateQueries: {
        dataType,
        emberUpdateType: 'createOrUpdate',
        update: updateQueryCache('offers')
    }
});