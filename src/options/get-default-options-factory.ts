import { noop } from '../common/util.ts';
import { STYLE_SHEET } from '../css/stylesheet.ts';
import type { CommentsOptions } from './index.ts';
import { SortKey } from './misc.ts';

export function getDefaultOptions(): Required<CommentsOptions> {
    return {
        // CurrentUser
        profilePictureURL: '',
        currentUserIsAdmin: false,
        currentUserId: '',

        // Icons
        spinnerIconURL: '',
        upvoteIconURL: '',
        replyIconURL: '',
        uploadIconURL: '',
        attachmentIconURL: '',
        noCommentsIconURL: '',
        closeIconURL: '',

        // Labels
        textareaPlaceholderText: 'Add a comment',
        newestText: 'Newest',
        oldestText: 'Oldest',
        popularText: 'Popular',
        commentsHeaderText: 'Comments (__commentCount__)',
        sendText: 'Send',
        replyText: 'Reply',
        editText: 'Edit',
        editedText: 'Edited',
        youText: 'You',
        saveText: 'Save',
        deleteText: 'Delete',
        newText: 'New',
        viewAllRepliesText: 'View all __replyCount__ replies',
        hideRepliesText: 'Hide replies',
        noCommentsText: 'No comments',
        attachmentDropText: 'Drop files here',

        // Functionalities
        enableReplying: true,
        enableEditing: true,
        enableUpvoting: true,
        enableDeleting: true,
        enableAttachments: false,
        enableHashtags: false,
        enablePinging: false,
        enableDeletingCommentWithReplies: false,
        postCommentOnEnter: false,
        forceResponsive: false,
        readOnly: false,
        defaultNavigationSortKey: SortKey.NEWEST,

        // Callbacks
        searchUsers: (_term, success) => success([]),
        searchTags: (term, success) => success([{ tag: term }]),
        getComments: (success) => success([]),
        postComment: (comment, success) => success(comment),
        putComment: (comment, success) => success(comment),
        deleteComment: (comment, success) =>
            success({
                ...comment,
                content: 'Deleted',
                isDeleted: true,
            }),
        upvoteComment: (comment, success) => success(comment),
        validateAttachments: (attachments, accept) => accept(attachments),
        hashtagClicked: noop,
        pingClicked: noop,
        refresh: noop,

        // Formatters
        timeFormatter: getDefaultTimeFormatter(),

        // Misc
        styles: [STYLE_SHEET],
        highlightColor: '#2793e6',
        deleteButtonColor: '#c9302c',

        highlightOwnComments: true,
        roundProfilePictures: false,
        textareaRows: 2,
        textareaRowsOnFocus: 3,
        maxRepliesVisible: 2,
    };
}

function getDefaultTimeFormatter(): (timestamp: Date) => string {
    const rtf: Intl.RelativeTimeFormat = new Intl.RelativeTimeFormat();

    return (timestamp) => {
        const epochNow = Math.floor(new Date().getTime() / 1000);
        const epochTimestamp = Math.floor(timestamp.getTime() / 1000);
        // Difference in seconds
        let diff = epochTimestamp - epochNow;
        diff ||= -1;

        if (diff > -60) {
            // Less than a minute has passed
            return rtf.format(diff, 'second');
        } else if (diff > -3_600) {
            // Less than an hour has passed
            return rtf.format(Math.floor(diff / 60), 'minute');
        } else if (diff > -86_400) {
            // Less than a day has passed
            return rtf.format(Math.floor(diff / 3_600), 'hour');
        } else if (diff > -2_620_800) {
            // Less than a month has passed
            return rtf.format(Math.floor(diff / 86_400), 'day');
        } else if (diff > -7_862_400) {
            // Less than three months has passed
            return rtf.format(Math.floor(diff / 2_620_800), 'week');
        } else {
            // More time has passed
            return (
                timestamp.toLocaleDateString(undefined, { dateStyle: 'short' }) +
                ' ' +
                timestamp.toLocaleTimeString(undefined, { timeStyle: 'short' })
            );
        }
    };
}
