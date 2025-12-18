import pkg from "crypto-js";
import { padTo32 } from "~/utils";

const { enc, AES } = pkg as any;

type VelitePost = {
    slug: string;
    title: string;
    date: string;
    category?: string;
    tags?: string[];
    encrypt_pwd?: string;
};

const encryptHtml = (pwd: string, html: string) => {
    const key = enc.Hex.parse(padTo32(pwd ? pwd : ""));
    return AES.encrypt(html, key, { iv: key }).toString();
};

const maybeEncryptHtml = (post: VelitePost, html: string) => {
    if (!post.encrypt_pwd) return html;
    return encryptHtml(post.encrypt_pwd, html);
};
export { maybeEncryptHtml };
