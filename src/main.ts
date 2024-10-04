import './comments-element.ts';
import './styles.css';
import {STYLE_SHEET} from "./css/stylesheet.ts";
import type {CommentsOptions} from "./options";
import styles
    from 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css' assert {type: 'css'};
import {commentsArray, usersArray} from "./shims/data.ts";

interface CommentsElement extends HTMLElement {
    options: CommentsOptions;
}

const fontAwesomeStyleSheet = styles;

let snackbarId: number;

function showSnackbar(text: string) {
    const snackbar = document.getElementById('snackbar') as HTMLElement;

    snackbar.querySelector('.content')!.textContent = text;
    snackbar.classList.add('show');

    clearTimeout(snackbarId);
    snackbarId = setTimeout(() => {
        snackbar.classList.remove('show');
    }, 2500);
}

const commentsElement = document.createElement('ithub-comments') as CommentsElement;

commentsElement.options = {
    profilePictureURL: 'https://i.pravatar.cc/100?img=65',
    currentUserId: 'current-user',
    roundProfilePictures: true,
    textareaRows: 1,
    enableAttachments: true,
    enableHashtags: true,
    enablePinging: true,
    styles: [STYLE_SHEET, fontAwesomeStyleSheet as CSSStyleSheet],
    searchUsers: (term: string, success: (s: typeof usersArray) => void) => {
        setTimeout(() => {
            success(usersArray.filter(user => {
                const containsSearchTerm = user.displayName?.toLowerCase().includes(term.toLowerCase())
                    || user.id.toLowerCase().includes(term.toLowerCase());
                const isNotSelf = user.id !== '1';
                return containsSearchTerm && isNotSelf;
            }));
        }, 500);
    },
    searchTags: (term: string, success: (s: {tag: string, description?: string}[]) => void) => {
        setTimeout(() => {
            const tags = [{tag: term, description: ''}];
            if ('velit'.startsWith(term) || term.startsWith('velit'))
                tags.unshift({tag: 'velit', description: 'Used 1 time in the current topic.'});
            if ('loremipsum'.startsWith(term) || term.startsWith('loremipsum'))
                tags.unshift({tag: 'loremipsum', description: 'Used 2 times in the current topic.'});
            success(tags);
        }, 239);
    },
    getComments: (success: (s: typeof commentsArray) => void ) => {
        setTimeout(() => {
            success(commentsArray);
        }, 389);
    },
    postComment: (comment: typeof commentsArray[0], success: (s: typeof commentsArray[0]) => void ) => {
        setTimeout(() => {
            success(comment);
        }, 542);
    },
    putComment: (comment: typeof commentsArray[0], success: (s: typeof commentsArray[0]) => void ) => {
        setTimeout(() => {
            success(comment);
        }, 504);
    },
    deleteComment: (comment: typeof commentsArray[0], success: (s: {content: string; attachments: File[]}) => void) => {
        setTimeout(() => {
            success({
                ...comment,
                content: 'Deleted',
                attachments: []
            });
        }, 512);
    },
    upvoteComment: (comment: typeof commentsArray[0], success: (s: typeof commentsArray[0]) => void) => {
        setTimeout(() => {
            success(comment);
        }, 380);
    },
    validateAttachments: (attachments: File[], callback: (f: File[]) => void) => {
        setTimeout(() => {
            callback(attachments);
        }, 768);
    },
    hashtagClicked: (hashtag: string) => {
        showSnackbar(`#${hashtag} clicked.`);
    },
    pingClicked: (userId: string) => {
        showSnackbar(`@${userId} clicked.`);
    },
};

document.querySelector('#demo-comments')!.append(commentsElement);