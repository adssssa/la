import APAvatar from '../global/APAvatar';
import React, {useState} from 'react';
import getRelativeTimestamp from '../../utils/get-relative-timestamp';
import getUsername from '../../utils/get-username';
import {ActorProperties, ObjectProperties} from '@tryghost/admin-x-framework/api/activitypub';
import {Button, Heading, Icon} from '@tryghost/admin-x-design-system';

export function renderAttachment(object: ObjectProperties, layout: string) {
    let attachment;
    if (object.image) {
        attachment = object.image;
    }

    if (object.type === 'Note' && !attachment) {
        attachment = object.attachment;
    }

    if (!attachment) {
        return null;
    }

    if (Array.isArray(attachment)) {
        const attachmentCount = attachment.length;

        let gridClass = '';
        if (layout === 'modal') {
            gridClass = 'grid-cols-1'; // Single image, full width
        } else if (attachmentCount === 2) {
            gridClass = 'grid-cols-2 auto-rows-[150px]'; // Two images, side by side
        } else if (attachmentCount === 3 || attachmentCount === 4) {
            gridClass = 'grid-cols-2 auto-rows-[150px]'; // Three or four images, two per row
        }

        return (
            <div className={`attachment-gallery mt-2 grid ${gridClass} gap-2`}>
                {attachment.map((item, index) => (
                    <img key={item.url} alt={`attachment-${index}`} className={`h-full w-full rounded-md object-cover ${attachmentCount === 3 && index === 0 ? 'row-span-2' : ''}`} src={item.url} />
                ))}
            </div>
        );
    }

    switch (attachment.mediaType) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
        return <img alt='attachment' className='mt-2 rounded-md outline outline-1 -outline-offset-1 outline-black/10' src={attachment.url} />;
    case 'video/mp4':
    case 'video/webm':
        return <div className='relative mb-4 mt-2'>
            <video className='h-[300px] w-full rounded object-cover' src={attachment.url} controls/>
        </div>;

    case 'audio/mpeg':
    case 'audio/ogg':
        return <div className='relative mb-4 mt-2 w-full'>
            <audio className='w-full' src={attachment.url} controls/>
        </div>;
    default:
        return null;
    }
}

interface FeedItemProps {
    actor: ActorProperties;
    object: ObjectProperties;
    layout: string;
    type: string;
}

const FeedItem: React.FC<FeedItemProps> = ({actor, object, layout, type}) => {
    const timestamp =
        new Date(object?.published ?? new Date()).toLocaleDateString('default', {year: 'numeric', month: 'short', day: '2-digit'}) + ', ' + new Date(object?.published ?? new Date()).toLocaleTimeString('default', {hour: '2-digit', minute: '2-digit'});

    const date = new Date(object?.published ?? new Date());

    const [isClicked, setIsClicked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikeClick = (event: React.MouseEvent<HTMLElement> | undefined) => {
        event?.stopPropagation();
        setIsClicked(true);
        setIsLiked(!isLiked);
        setTimeout(() => setIsClicked(false), 300); // Reset the animation class after 300ms
    };

    let author = actor;
    if (type === 'Announce' && object.type === 'Note') {
        author = typeof object.attributedTo === 'object' ? object.attributedTo as ActorProperties : actor;
    }

    return (
        <>
            {object && (
                <div className={`group/article relative cursor-pointer ${(layout === 'feed') ? 'pt-5' : ''}`}>
                    {(type === 'Announce' && object.type === 'Note') && <div className='z-10 mb-2 flex items-center gap-3 text-grey-700'>
                        <div className='z-10 flex w-10 justify-end'><Icon colorClass='text-grey-700' name='reload' size={'sm'}></Icon></div>
                        <span className='z-10'>{actor.name} reposted</span>
                    </div>}
                    <div className={`border-1 z-10 -my-1 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-3 ${(layout === 'modal') ? 'gap-y-2' : 'gap-y-1'} border-b border-b-grey-200 pb-4`} data-test-activity>
                        <div className='relative z-10 pt-[3px]'>
                            <APAvatar author={author}/>
                        </div>
                        {/* <div className='border-1 z-10 -mt-1 flex w-full flex-col items-start justify-between border-b border-b-grey-200 pb-4' data-test-activity> */}
                        <div className='relative z-10 flex w-full flex-col overflow-visible text-[1.5rem]'>
                            <div className='flex'>
                                <span className='truncate whitespace-nowrap font-bold' data-test-activity-heading>{author.name}</span>
                                <span className='whitespace-nowrap text-grey-700 before:mx-1 before:content-["·"]' title={`${timestamp}`}>{getRelativeTimestamp(date)}</span>
                            </div>
                            <div className='flex'>
                                <span className='truncate text-grey-700'>{getUsername(author)}</span>
                            </div>
                        </div>
                        <div className={`relative z-10 ${(layout === 'modal') ? 'col-start-1' : 'col-start-2'} col-end-3 w-full gap-4`}>
                            <div className='flex flex-col'>
                                {object.name && <Heading className='mb-1 leading-tight' level={4} data-test-activity-heading>{object.name}</Heading>}
                                <div dangerouslySetInnerHTML={({__html: object.content})} className='ap-note-content text-pretty text-[1.5rem] text-grey-900'></div>
                                {/* <p className='text-pretty text-md text-grey-900'>{object.content}</p> */}
                                {renderAttachment(object, layout)}
                                <div className='mt-3 flex gap-2'>
                                    <Button className={`self-start text-grey-500 transition-all hover:text-grey-800 ${isClicked ? 'bump' : ''} ${isLiked ? 'ap-red-heart text-red *:!fill-red hover:text-red' : ''}`} hideLabel={true} icon='heart' id='like' size='md' unstyled={true} onClick={handleLikeClick}/>
                                    <span className={`text-grey-800 ${isLiked ? 'opacity-100' : 'opacity-0'}`}>1</span>
                                </div>
                            </div>
                        </div>
                        {/* </div> */}
                    </div>
                    <div className={`absolute -inset-x-3 -inset-y-0 z-0 rounded transition-colors ${(layout === 'feed') ? 'group-hover/article:bg-grey-75' : ''} `}></div>
                </div>
            )}
        </>
    );
};

export default FeedItem;