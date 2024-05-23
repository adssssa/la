import {createMutation, createQueryWithId} from '../utils/api/hooks';

export type FollowItem = {
    id: string;
    username: string
};

export type Activity = {
    id: string;
    type: string;
    summary: string;
    actor: object;
    object: {
        type: 'Article' | 'Link';
    };
}

export type InboxResponseData = {
    '@context': string;
    id: string;
    summary: string;
    type: string;
    totalItems: number;
    orderedItems: Activity[];
}

export type FollowingResponseData = {
    '@context': string;
    id: string;
    summary: string;
    type: string;
    totalItems: number;
    items: FollowItem[];
}

type FollowData = {
    username: string
}

export const useFollow = createMutation<object, FollowData>({
    method: 'POST',
    path: data => `/activitypub/follow/${data.username}`
});

const dataType = 'InboxResponseData';

// This is a frontend root, not using the Ghost admin API
export const useBrowseInboxForUser = createQueryWithId<InboxResponseData>({
    dataType,
    useActivityPub: true,
    path: id => `/inbox/${id}`
});

export const useBrowseFollowingForUser = createQueryWithId<FollowingResponseData>({
    dataType,
    useActivityPub: true,
    path: id => `/following/${id}`
});
