// app.config.ts
import { defineConfig } from "@solidjs/start/config";
import path2 from "path";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import { fileURLToPath } from "url";

// plugin/jsonx.ts
import { extname } from "path";

// plugin/PostLoader.ts
import crypto from "crypto-js";
import { readFileSync } from "fs";
import path from "path";

// src/utils/index.tsx
var padTo32 = (str) => {
  if (str.length >= 32) {
    return str.slice(0, 32);
  }
  const paddingLength = 32 - str.length;
  const padding = "0".repeat(paddingLength);
  return str + padding;
};

// plugin/codeHighlight.ts
import { load } from "cheerio";
import hljs from "highlight.js";
import { encode } from "js-base64";
var renderHighlight = (content) => {
  const $ = load(content, { xmlMode: true, decodeEntities: false });
  $("Pre").each((index, element) => {
    const lang = $(element).attr("lang");
    if (!lang)
      throw new Error("lang is not defined");
    if (lang.includes("$lang"))
      return;
    const code = $(element).find("code").html() || "";
    const highlightedCode = hljs.highlight(code, { language: lang }).value;
    $(element).html(encode(highlightedCode));
  });
  return $.html();
};
var codeHighlight_default = renderHighlight;

// plugin/escapeBracket.ts
import { load as load2 } from "cheerio";
var wrapTable = ($) => {
  $("table").wrap('<div class="table-wrapper"></div>');
  return $;
};
var escapeBracket = (content) => {
  const bracketPattern = /[\{\}]/g;
  let $ = load2(content.replaceAll("<hr>", "<hr/>"), { xmlMode: true, decodeEntities: false });
  $ = wrapTable($);
  $("p").each((index, element) => {
    const text = $(element).html() || "";
    const escapedText = text.replace(bracketPattern, (match) => {
      try {
        const escapeResult = `{'${match}'}`;
        return escapeResult;
      } catch (err) {
        return match;
      }
    });
    $(element).html(escapedText);
  });
  return $.html();
};
var escapeBracket_default = escapeBracket;

// plugin/mathRender.ts
import { load as load3 } from "cheerio";
import { encode as encode2 } from "js-base64";
import he from "he";
import katex from "katex";
var renderMath = (content) => {
  const mathPattern = /\$\$([\s\S]+?)\$\$/g;
  let result = content.replace(mathPattern, (match, formula) => {
    try {
      const renderResult = katex.renderToString(he.decode(formula), { output: "html", displayMode: true });
      let $ = load3(renderResult);
      $("annotation").remove();
      return `<MathDecode>${encode2($("body").html())}</MathDecode>`;
    } catch (err) {
      console.error("Failed to render math formula:", err.message);
      return match;
    }
  });
  return result;
};
var mathRender_default = renderMath;

// plugin/PostLoader.ts
var findRelatedPosts = (sameTagPosts, sameCatePosts) => {
  const blogScore = {};
  Object.entries(sameTagPosts).map(([tag, blogs]) => {
    blogs.map((blog) => {
      if (blogScore[blog.slug]) {
        blogScore[blog.slug].score += 1;
      } else {
        blogScore[blog.slug] = {
          score: 1,
          blog
        };
      }
    });
  });
  sameCatePosts.map((blog) => {
    if (blogScore[blog.slug]) {
      blogScore[blog.slug].score += 0.5;
    } else {
      blogScore[blog.slug] = {
        score: 0.5,
        blog
      };
    }
  });
  const sortedBlogs = Object.values(blogScore).sort((a, b) => b.score - a.score).map((blog) => ({
    "title": blog.blog.title,
    "slug": blog.blog.slug,
    "date": blog.blog.date,
    "score": blog.score
  }));
  return sortedBlogs.slice(0, 6);
};
var getSameTaxoBlogs = (tags, category, slug) => {
  let sameCateBlogs = [], sameTagBlogs = {};
  const sameCate = readFileSync(path.join(process.cwd(), "(hugo)/category", `${category}/index.jsx`), "utf-8").slice(15, -1);
  sameCateBlogs.push(...JSON.parse(sameCate).pages.filter((blog) => blog.slug != slug));
  const sameTags = tags.map((tag) => JSON.parse(readFileSync(path.join(process.cwd(), "(hugo)/tags", `${tag}/index.jsx`), "utf-8").slice(15, -1)));
  sameTags.forEach((tag) => sameTagBlogs[tag.term] = tag.pages.filter((blog) => blog.slug !== slug));
  return findRelatedPosts(sameTagBlogs, sameCateBlogs);
};
var encryptBlog = (pwd, content) => {
  const key = crypto.enc.Hex.parse(padTo32(pwd ? pwd : ""));
  return crypto.AES.encrypt(content, key, { iv: key }).toString();
};
var PostLoader = (parsedContent) => {
  let { content, ...rest } = parsedContent;
  const loadHighlightCSS = content?.includes("Pre lang");
  if (loadHighlightCSS)
    content = codeHighlight_default(content);
  if (parsedContent.mathrender)
    content = mathRender_default(content);
  if (parsedContent.password)
    content = encryptBlog(parsedContent.password, content);
  content = escapeBracket_default(content);
  const relates = getSameTaxoBlogs(parsedContent.tags, parsedContent.category, parsedContent.slug);
  const transformedCode = `
        import { A } from "@solidjs/router";
        import { lazy } from "solid-js";
        import Img from "~/components/lazy/Img"
        ${loadHighlightCSS ? 'const Pre = lazy(() => import("~/components/lazy/Pre"));' : ""}
        ${parsedContent.mathrender ? 'import MathDecode from "~/components/lazy/MathDecode"' : ""}
        const PostLayout = lazy(() => import("~/components/layouts/PostLayout"))

        const Post = () => {
            return (
                    <PostLayout rawBlog={${JSON.stringify(rest)}} relates={${JSON.stringify(relates)}}>
                        ${content}
                    </PostLayout>
            )
        }
        export default Post;
    `;
  return {
    code: transformedCode,
    map: null
  };
};
var PostLoader_default = PostLoader;

// plugin/base/loader.ts
var AboutLoader = (parsedContent) => {
  const { content, ...rest } = parsedContent;
  const transformedCode = `
                import { A } from "@solidjs/router"
                import PostLayout from "~/components/layouts/PostLayout"
                
                const About = () => {
                    return (
                        <PostLayout rawBlog={${JSON.stringify(rest)}}>
                                ${content}
                        </PostLayout>
                    )
                }
                
                export default About;
    `;
  return transformedCode;
};
var OtherPageLoader = (parsedContent, name) => {
  const { content, ...rest } = parsedContent;
  const transformCode = `
        import { A } from "@solidjs/router";
        import ${name} from "~/components/page/${name}"

        const OtherPage = () => {
            return (
                <${name} page={${JSON.stringify(rest)}}>
                    ${content}
                </${name}>
            )
        }
        export default OtherPage;
    `;
  return transformCode;
};
var ArchLoader = (parsedContent) => {
  const { _, ...rest } = parsedContent;
  const transformCode = `
        import { A } from "@solidjs/router"
        import { Suspense } from "solid-js";

        import Arch from "~/components/page/Archives"
        const ArchPage = () => {
            return (
                <Arch page={${JSON.stringify(rest)}} />
            )
        }
        export default ArchPage;
    `;
  return transformCode;
};
var BaseLoader = (parsedContent) => {
  if (parsedContent.slug.startsWith("/about")) {
    return AboutLoader(parsedContent);
  } else if (parsedContent.slug.startsWith("/life")) {
    return OtherPageLoader(parsedContent, "Life");
  } else if (parsedContent.slug.startsWith("/search")) {
    return OtherPageLoader(parsedContent, "Search");
  } else if (parsedContent.slug.startsWith("/friends")) {
    return OtherPageLoader(parsedContent, "Friends");
  } else if (parsedContent.slug.startsWith("/archives")) {
    return ArchLoader(parsedContent);
  }
  return AboutLoader(parsedContent);
};
var loader_default = BaseLoader;

// plugin/jsonx.ts
var getFileBaseName = (filepath) => {
  const cleanFilePath = filepath.split("?")[0];
  const fileName = extname(cleanFilePath);
  return fileName;
};
var isValidJsonXPath = (filepath) => {
  if (getFileBaseName(filepath) == ".jsx" && filepath.includes("(hugo)"))
    return true;
  return false;
};
var TaxoLoader = (content, type) => {
  const transformedCode = `
                import { lazy } from "solid-js";
                const TaxoLayout = lazy(() => import("~/components/layouts/TaxoLayout"))
                const Taxo = () => {
                    return (
                        <TaxoLayout rawTaxo={${content}} type="${type}" />
                    )
                }
                export default Taxo;
    `;
  return {
    code: transformedCode,
    map: null
  };
};
var checkType = (id) => {
  if (id.includes("/posts/")) {
    return "post";
  } else if (id.includes("/tags/")) {
    return "tags";
  } else if (id.includes("/category/")) {
    return "category";
  } else {
    return "base";
  }
};
function jsonx_default() {
  const processedFiles = /* @__PURE__ */ new Set();
  const plugin = {
    name: "jsx-plugin",
    enforce: "pre",
    async transform(content, id) {
      if (!isValidJsonXPath(id))
        return null;
      const filepath = id.split("?")[0];
      const parsedContent = JSON.parse(content.slice(15, -1));
      const _type = checkType(id);
      if (_type === "base") {
        return loader_default(parsedContent);
      } else if (_type === "post") {
        return PostLoader_default(parsedContent);
      } else if (_type === "tags") {
        return TaxoLoader(content.slice(15, -1), "\u6807\u7B7E");
      } else if (_type === "category") {
        return TaxoLoader(content.slice(15, -1), "\u5206\u7C7B");
      }
      return "<></>";
    }
  };
  return plugin;
}

// (hugo)/base/index.json
var base_default = {
  type: "base",
  term: "bases",
  pages: [
    {
      title: "\u5173\u4E8E",
      slug: "about",
      lang: "zh-CN",
      cover: "https://ae01.alicdn.com/kf/HTB1GZnbaiDxK1RjSsph762HrpXam.png",
      words: 878,
      category: "<no value>",
      date: "2017-05-10T22:46:00+0800"
    },
    {
      title: "\u6D88\u9063",
      slug: "life",
      lang: "zh-CN",
      words: 174,
      category: "<no value>",
      date: "2019-05-28T00:00:00+0800"
    },
    {
      title: "\u5F52\u6863",
      slug: "archives",
      lang: "zh-CN",
      words: 0,
      category: "<no value>",
      date: "2023-02-17T00:00:00+0800"
    },
    {
      title: "\u53CB\u94FE",
      slug: "friends",
      lang: "zh-CN",
      words: 352,
      category: "<no value>",
      date: "2019-05-28T00:00:00+0800"
    },
    {
      title: "\u641C\u7D22",
      slug: "search",
      lang: "zh-CN",
      words: 136,
      category: "<no value>",
      date: "2021-02-17T00:00:00+0800"
    }
  ]
};

// (hugo)/category/index.json
var category_default = {
  term: "Category",
  pages: [{ count: 20, title: "\u5206\u4EAB\u5883" }, { count: 8, title: "\u535A\u5BA2\u6808" }, { count: 18, title: "\u5B9E\u9A8C\u5BA4" }, { count: 3, title: "\u6587\u5B57\u9601" }, { count: 20, title: "\u788E\u788E\u5FF5" }, { count: 1, title: "\u884C\u8D70\u8BB0" }]
};

// (hugo)/posts/index.json
var posts_default = {
  type: "posts",
  term: "Posts",
  pages: [
    {
      title: "\u57FA\u4E8E OpenCL \u751F\u6210 Solana \u865A\u8363\u5730\u5740",
      subtitle: "\u66F4\u5FEB\u521B\u5EFA\u81EA\u5B9A\u4E49 Solana \u5730\u5740",
      slug: "generating-solana-vanity-addresses-using-opencl",
      lang: "zh-CN",
      cover: "https://ae01.alicdn.com/kf/A265e452930054ffa8ff7e92423dd7e69Z.jpg",
      words: 2890,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2024-03-04T12:28:59+0800"
    },
    {
      title: "Quantumult X \u7684\u94FE\u5F0F\u4EE3\u7406\u914D\u7F6E",
      subtitle: "\u907F\u514D\u673A\u573A\u5BA1\u8BA1\u7684\u4E00\u79CD\u65B9\u6848",
      slug: "quantumult-x-chain-proxy-setup",
      words: 2973,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2023-11-12T10:50:12+0800"
    },
    {
      title: "\u4E16\u754C\u4E0E\u6211\u7684\u4E00\u6B21\u9082\u9005",
      subtitle: "\u5E74\u8F7B\u4EBA\u7684\u7B2C\u4E00\u6B21\u51FA\u56FD\u65C5\u884C",
      slug: "when-the-world-met-me",
      words: 4215,
      category: "\u884C\u8D70\u8BB0",
      date: "2023-10-13T10:36:23+0800"
    },
    {
      title: "\u79BB\u804C\uFF0C\u4E09\u5E74\u672A\u6EE1",
      subtitle: "\u5F88\u4E0D\u820D\uFF0C\u4F46\u6CA1\u6709\u66F4\u597D\u7684\u9009\u62E9",
      slug: "company-departure-after-3-years",
      words: 3604,
      category: "\u788E\u788E\u5FF5",
      date: "2023-05-31T23:59:59+0800"
    },
    {
      title: "\u4F7F\u7528 Hugo + SolidStart \u91CD\u6784\u535A\u5BA2",
      subtitle: "\u4ECA\u5E74\u5EA6\u7684\u91CD\u6784\u535A\u5BA2\uFF0C\u6BD4\u4EE5\u5F80\u6765\u7684\u66F4\u65E9\u4E00\u4E9B",
      slug: "reconstruct-my-blog-with-hugo-solidstart",
      words: 7640,
      category: "\u535A\u5BA2\u6808",
      date: "2023-05-07T14:01:23+0800"
    },
    {
      title: "OpenCore \u5F15\u5BFC\u5B89\u88C5 macOS Ventura \u6559\u7A0B",
      subtitle: "\u4ECE\u96F6\u5F00\u59CB\u5B89\u88C5\u9ED1\u82F9\u679C\u8BB0\u5F55",
      slug: "open-core-boot-macos-ventura-tutorial",
      words: 6199,
      category: "\u5206\u4EAB\u5883",
      date: "2023-04-05T11:51:31+0800"
    },
    {
      title: "ChatGPT \u4E0E TTS \u4E4B\u95F4\u5947\u5999\u7684\u53CD\u5E94",
      subtitle: "\u4E00\u79CD\u5F88\u65B0\u7684\u667A\u80FD\u8BED\u97F3\u52A9\u624B",
      slug: "chatgpt-and-tts-work-together",
      lang: "zh-CN",
      words: 3007,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2023-03-14T23:35:09+0800"
    },
    {
      title: "2022 \u5E74\u7EC8\u603B\u7ED3",
      subtitle: "\u7EAA\u5FF5\u6211\u968F\u98CE\u98D8\u6563\u7684 2022",
      slug: "2022-year-end-summary",
      words: 1979,
      category: "\u788E\u788E\u5FF5",
      date: "2023-02-07T20:14:34+0800"
    },
    {
      title: "\u6211\u6700\u8FD1\u8BA2\u9605\u7684\u4E00\u4E9B\u8F6F\u4EF6\u670D\u52A1",
      subtitle: "\u5305\u62EC\u79D1\u5B66\u4E0A\u7F51\u3001VPS \u7B49",
      slug: "software-services-I-recently-subscribed",
      words: 3324,
      category: "\u5206\u4EAB\u5883",
      date: "2022-12-10T12:59:03+0800"
    },
    {
      title: "\u804A\u804A\u535A\u5BA2\u4E3B\u9898\u7684\u66F4\u65B0",
      subtitle: "\u535A\u5BA2\u4E3B\u9898\u7684\u4FDD\u8D28\u671F\u4E00\u822C\u4E3A\u4E24\u5E74",
      slug: "about-recent-blog-updates",
      words: 1880,
      category: "\u535A\u5BA2\u6808",
      date: "2022-09-15T23:45:08+0800"
    },
    {
      title: "\u4ECE\u4E00\u6B21 DNS \u6D41\u91CF\u6D4B\u8BD5\u8BF4\u8D77",
      subtitle: "\u5982\u4F55\u4F2A\u9020\u4E00\u4E2A\u6B63\u5E38\u7684 DNS \u8BF7\u6C42",
      slug: "start-with-a-dns-traffic-test",
      words: 3837,
      category: "\u5206\u4EAB\u5883",
      date: "2022-07-02T19:29:20+0800"
    },
    {
      title: "\u6211\u7684 FreeBSD \u670D\u52A1\u5668\u914D\u7F6E",
      slug: "set-up-freebsd-server-of-mine",
      words: 3661,
      category: "\u5206\u4EAB\u5883",
      date: "2021-11-27T18:04:55+0800"
    },
    {
      title: "Type-Length-Value Encoding Scheme Practice",
      slug: "tlv-encoding-practice",
      lang: "en",
      words: 907,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2021-05-05T14:04:02+0800"
    },
    {
      title: "\u8FDF\u6765\u7684 2020 \u5E74\u7EC8\u603B\u7ED3",
      slug: "summary-of-2020",
      words: 5150,
      category: "\u788E\u788E\u5FF5",
      date: "2021-03-31T00:24:02+0800"
    },
    {
      title: "\u535A\u5BA2\u641C\u7D22\u529F\u80FD\u6B63\u5F0F\u4E0A\u7EBF",
      slug: "blog-search-is-ready",
      words: 3385,
      category: "\u535A\u5BA2\u6808",
      date: "2021-03-21T10:33:00+0800"
    },
    {
      title: "Hexo\uFF0C\u518D\u4E5F\u4E0D\u89C1",
      subtitle: "\u8FC1\u79FB\u535A\u5BA2\u81F3 Hugo \u7684\u4E00\u4E9B\u7262\u9A9A",
      slug: "migrating-from-hexo-to-hugo",
      words: 2306,
      category: "\u535A\u5BA2\u6808",
      date: "2020-11-15T08:18:26+0800"
    },
    {
      title: "Python \u5E76\u53D1\u4E4B\u75DB\uFF1A\u7EBF\u7A0B\uFF0C\u534F\u7A0B\uFF1F",
      slug: "c12de45e",
      words: 3274,
      category: "\u5206\u4EAB\u5883",
      date: "2020-09-29T20:43:29+0800"
    },
    {
      title: "\u57FA\u4E8E ETS \u7684\u6F0F\u6597\u9650\u6D41",
      slug: "16c559c7",
      words: 2132,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2020-07-08T18:36:34+0800"
    },
    {
      title: "\u79BB\u804C\u7684\u4E24\u4E2A\u6708\u4E4B\u540E",
      slug: "ee6b678",
      words: 1788,
      category: "\u788E\u788E\u5FF5",
      date: "2020-05-22T14:40:12+0800"
    },
    {
      title: "\u4F7F\u7528 OpenCore \u5F15\u5BFC\u9ED1\u82F9\u679C\u8E29\u5751\u8BB0\u5F55",
      slug: "7a2a84c6",
      words: 2746,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2020-04-22T21:02:19+0800"
    },
    {
      title: "Kubernetes \u521D\u63A2",
      slug: "e0246a27",
      words: 2392,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2020-03-16T12:27:32+0800"
    },
    {
      title: "\u6211\u7684\u5B66\u751F\u65F6\u4EE3\uFF08\u5927\u5B66\u7BC7\uFF09",
      slug: "71f1f91c",
      words: 5022,
      category: "\u788E\u788E\u5FF5",
      date: "2020-02-10T17:30:03+0800"
    },
    {
      title: "\u7D2F\u52A0\u5668\u5F15\u53D1\u7684\u4E00\u70B9\u601D\u8003",
      slug: "286f4007",
      words: 2218,
      category: "\u5206\u4EAB\u5883",
      date: "2020-01-30T10:42:09+0800"
    },
    {
      title: "2019 \xB7 \u7EC8\u7109",
      slug: "a9aef93a",
      words: 3355,
      category: "\u788E\u788E\u5FF5",
      date: "2020-01-01T17:10:26+0800"
    },
    {
      title: "\u8BB0\u4E00\u6B21\u53CD\u5411\u4EE3\u7406\u7684\u642D\u5EFA",
      slug: "1352252a",
      words: 2048,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2019-07-04T11:47:43+0800"
    },
    {
      title: "\u6211\u7684\u5B66\u751F\u65F6\u4EE3\uFF08\u9AD8\u4E2D\u7BC7\uFF09",
      slug: "5fdce618",
      words: 2827,
      category: "\u788E\u788E\u5FF5",
      date: "2019-06-15T13:53:44+0800"
    },
    {
      title: "\u5947\u5B89\u4FE1\uFF08\u539F 360 \u4F01\u4E1A\u5B89\u5168\uFF09\u670D\u52A1\u7AEF\u5F00\u53D1\u9762\u7ECF",
      slug: "d42e79bb",
      words: 1908,
      category: "\u5206\u4EAB\u5883",
      date: "2019-05-18T12:34:04+0800"
    },
    {
      title: "\u9AD8\u6821\u751F\u4F7F\u7528\u6559\u80B2\u7F51\u7684\u4E00\u70B9\u59FF\u52BF",
      slug: "36b4c1ab",
      words: 2423,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2019-04-27T09:53:04+0800"
    },
    {
      title: "Linux \u4E0E Android \u540C\u6B65\u526A\u8D34\u677F\u7684\u901A\u7528\u65B9\u6848",
      slug: "d691e748",
      words: 1212,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2019-01-12T12:01:23+0800"
    },
    {
      title: "\u6211\u7684 2018 \u8F68\u8FF9",
      slug: "e4e1357d",
      words: 547,
      category: "\u788E\u788E\u5FF5",
      date: "2018-12-27T10:52:16+0800"
    },
    {
      title: "Elasticsearch \u96C6\u7FA4\u5907\u4EFD\u6307\u5357",
      slug: "92d76830",
      words: 1591,
      category: "\u5206\u4EAB\u5883",
      date: "2018-10-27T21:55:12+0800"
    },
    {
      title: "Python \u77E5\u591A\u5C11\uFF08\u4E8C\uFF09\u2014\u2014\u7EE7\u627F",
      slug: "58dd3c61",
      words: 3165,
      category: "\u5206\u4EAB\u5883",
      date: "2018-10-21T18:18:20+0800"
    },
    {
      title: "\u676D\u5DDE\u89C1\u95FB",
      slug: "2848ddef",
      words: 1614,
      category: "\u788E\u788E\u5FF5",
      date: "2018-09-21T21:11:33+0800"
    },
    {
      title: "\u5199\u7ED9 21 \u5C81\u7684\u81EA\u5DF1",
      slug: "d9253d8c",
      words: 1334,
      category: "\u788E\u788E\u5FF5",
      date: "2018-08-29T00:00:00+0800"
    },
    {
      title: "\u535A\u5BA2\u6298\u817E\u5C0F\u8BB0",
      slug: "50658b02",
      words: 1806,
      category: "\u535A\u5BA2\u6808",
      date: "2018-08-22T11:31:58+0800"
    },
    {
      title: "Python \u77E5\u591A\u5C11\uFF08\u4E00\uFF09\u2014\u2014\u4E0D\u5E38\u89C1\u7684\u6570\u636E\u7ED3\u6784",
      slug: "dbcdebb",
      words: 2341,
      category: "\u5206\u4EAB\u5883",
      date: "2018-08-08T11:30:32+0800"
    },
    {
      title: "\u57FA\u4E8E Socket \u7F16\u5199 HTTP \u670D\u52A1\u5668",
      slug: "89381f22",
      words: 2705,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2018-08-03T12:06:13+0800"
    },
    {
      title: "Hitokoto\uFF08\u4E00\u8A00\uFF09API 2.0 \u6B63\u5F0F\u4E0A\u7EBF",
      slug: "a5c39267",
      words: 1367,
      category: "\u5206\u4EAB\u5883",
      date: "2018-07-16T11:48:15+0800"
    },
    {
      title: "\u535A\u5BA2\u8BBF\u95EE\u7EDF\u8BA1\u62A5\u544A\uFF082017.6.20-2018.7.4\uFF09",
      slug: "790223d2",
      words: 1573,
      category: "\u535A\u5BA2\u6808",
      date: "2018-07-05T10:52:34+0800"
    },
    {
      title: "\u4F7F\u7528\u6301\u7EED\u96C6\u6210\uFF08CI\uFF09\u5F00\u53D1\u9879\u76EE",
      slug: "f011ea9c",
      words: 1875,
      category: "\u5206\u4EAB\u5883",
      date: "2018-06-09T10:22:34+0800"
    },
    {
      title: "Sorry\uFF0C\u4F1A\u5199\u4EE3\u7801\u771F\u7684\u80FD\u4E3A\u6240\u6B32\u4E3A",
      slug: "8575e868",
      words: 2209,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2018-05-27T10:34:21+0800"
    },
    {
      title: "Python \u5B57\u5178\u7684\u539F\u7406\u53CA\u9AD8\u7EA7\u7528\u6CD5",
      slug: "4f2b4bfb",
      words: 1949,
      category: "\u5206\u4EAB\u5883",
      date: "2018-05-12T09:23:02+0800"
    },
    {
      title: "\u300A\u4EE3\u7801\u6574\u6D01\u4E4B\u9053\u300B\u8BFB\u4E66\u7B14\u8BB0",
      slug: "65e48179",
      words: 4996,
      category: "\u6587\u5B57\u9601",
      date: "2018-04-19T18:11:12+0800"
    },
    {
      title: "Nextcloud \u642D\u5EFA\u79C1\u4EBA\u4E91\u670D\u52A1\u6559\u7A0B",
      slug: "bf0413ac",
      words: 2075,
      category: "\u5206\u4EAB\u5883",
      date: "2018-03-31T15:03:31+0800"
    },
    {
      title: "\u6CA1\u6709\u5E0C\u671B\u7684\u4E8B\u513F\uFF0C\u8FD8\u6709\u575A\u6301\u7684\u5FC5\u8981\u5417",
      slug: "18b98ea6",
      words: 625,
      category: "\u788E\u788E\u5FF5",
      date: "2018-03-21T10:47:45+0800"
    },
    {
      title: "QQ \u97F3\u4E50\u5916\u94FE\u89E3\u6790",
      slug: "72171293",
      words: 2180,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2018-03-07T12:23:06+0800"
    },
    {
      title: "\u4E00\u53F0 VPS \u7684\u6B63\u786E\u6253\u5F00\u65B9\u5F0F",
      slug: "b3085a7",
      words: 2480,
      category: "\u5206\u4EAB\u5883",
      date: "2018-02-22T19:38:04+0800"
    },
    {
      title: "\u300A\u9ED1\u5BA2\u4E0E\u753B\u5BB6\u300B\u8BFB\u4E66\u7B14\u8BB0",
      slug: "a6c2a51d",
      words: 3817,
      category: "\u6587\u5B57\u9601",
      date: "2018-01-26T17:11:29+0800"
    },
    {
      title: "\u8C46\u74E3\u7535\u5F71 Top 250 \u6570\u636E\u5206\u6790",
      slug: "7a8186a0",
      words: 2044,
      category: "\u5206\u4EAB\u5883",
      date: "2018-01-21T10:24:29+0800"
    },
    {
      title: "\u518D\u89C1\uFF0C2017",
      slug: "5873b0c0",
      words: 1435,
      category: "\u788E\u788E\u5FF5",
      date: "2017-12-29T10:46:06+0800"
    },
    {
      title: "\u4ECE GnuPG \u7684\u4F7F\u7528\u8C08\u8C08\u5BC6\u7801\u5B66",
      slug: "4aa5d46d",
      words: 2226,
      category: "\u5206\u4EAB\u5883",
      date: "2017-12-11T09:26:16+0800"
    },
    {
      title: "Web \u6027\u80FD\u4F18\u5316\uFF08\u4E00\uFF09\u2014\u2014\u4F7F\u7528 localStorage",
      slug: "a9d193c6",
      words: 969,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2017-11-30T15:09:34+0800"
    },
    {
      title: "\u8FD9\u76DB\u4E16\u53EF\u5982\u4F60\u6240\u613F\uFF1F",
      slug: "d67271d8",
      words: 1072,
      category: "\u788E\u788E\u5FF5",
      date: "2017-11-24T14:10:04+0800"
    },
    {
      title: "Poker \u673A\u68B0\u952E\u76D8\u5F00\u7BB1\u4E0E\u7B80\u8BC4",
      slug: "72474942",
      words: 1493,
      category: "\u788E\u788E\u5FF5",
      date: "2017-11-02T13:56:40+0800"
    },
    {
      title: "\u6784\u5EFA\u4E00\u8A00 API \u8E29\u5751\u8BB0\u5F55",
      slug: "f6e1eb2a",
      words: 1663,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2017-10-30T10:44:41+0800"
    },
    {
      title: "Linux \u4E0E Windows 10 \u7528 GRUB \u5F15\u5BFC\u6559\u7A0B",
      slug: "ad42f575",
      words: 2075,
      category: "\u5206\u4EAB\u5883",
      date: "2017-10-17T11:35:19+0800"
    },
    {
      title: "Kindle Papwerwhite \u5F00\u7BB1 & \u7B80\u8BC4",
      slug: "6619f85a",
      words: 1080,
      category: "\u788E\u788E\u5FF5",
      date: "2017-10-05T12:33:46+0800"
    },
    {
      title: "Spacemacs \u751F\u5B58\u6307\u5317",
      slug: "2aa541e6",
      words: 1603,
      category: "\u5206\u4EAB\u5883",
      date: "2017-09-26T13:01:33+0800"
    },
    {
      title: "\u5199\u7ED9 20 \u5C81\u7684\u81EA\u5DF1",
      slug: "11ab0263",
      words: 1537,
      category: "\u788E\u788E\u5FF5",
      date: "2017-08-29T00:00:00+0800"
    },
    {
      title: "\u518D\u89C1 LiveRe\uFF0C\u62E5\u62B1 Disqus",
      slug: "e5d13eb",
      words: 924,
      category: "\u535A\u5BA2\u6808",
      date: "2017-07-29T10:08:32+0800"
    },
    {
      title: "\u4F7F\u7528 Service Worker \u4F18\u5316\u7F51\u7AD9",
      slug: "a0df572f",
      words: 892,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2017-07-25T13:06:47+0800"
    },
    {
      title: "Python \u5B9E\u73B0\u591A\u7EBF\u7A0B\u4E0B\u8F7D\u5668",
      slug: "80689c8d",
      words: 906,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2017-07-19T14:53:24+0800"
    },
    {
      title: "\u5BFC\u51FA QQ \u804A\u5929\u8BB0\u5F55",
      slug: "1060d444",
      words: 832,
      category: "\u5B9E\u9A8C\u5BA4",
      date: "2017-07-01T15:57:33+0800"
    },
    {
      title: "\u5173\u4E8E\u7537\u4E52\u9000\u8D5B\u7684\u4E00\u70B9\u770B\u6CD5",
      slug: "2cdb7149",
      words: 2057,
      category: "\u788E\u788E\u5FF5",
      date: "2017-06-24T10:32:34+0800"
    },
    {
      title: "\u89E3\u9664\u767E\u5EA6\u4E91\u4E0B\u8F7D\u9650\u901F",
      slug: "cfd78fa9",
      words: 2233,
      category: "\u5206\u4EAB\u5883",
      date: "2017-06-15T14:32:00+0800"
    },
    {
      title: "Manjaro \u5927\u6CD5\u597D",
      slug: "7e325dad",
      words: 467,
      category: "\u788E\u788E\u5FF5",
      date: "2017-06-08T21:18:32+0800"
    },
    {
      title: "Hexo \u535A\u5BA2\u5907\u4EFD",
      slug: "7efd2818",
      words: 1224,
      category: "\u535A\u5BA2\u6808",
      date: "2017-06-02T21:37:00+0800"
    },
    {
      title: "\u7AEF\u5348\u8BB0",
      slug: "859c63e4",
      words: 366,
      category: "\u788E\u788E\u5FF5",
      date: "2017-05-28T00:09:20+0800"
    },
    {
      title: "\u4E66\u63A8\uFF1A\u96EA\u4E2D\u608D\u5200\u884C",
      slug: "9a260fa1",
      words: 4669,
      category: "\u6587\u5B57\u9601",
      date: "2017-05-06T13:45:54+0800"
    },
    {
      title: "Hello World",
      slug: "4a17b156",
      words: 266,
      category: "\u788E\u788E\u5FF5",
      date: "2017-05-05T13:38:10+0800"
    }
  ]
};

// (hugo)/tags/index.json
var tags_default = {
  term: "Tags",
  pages: [{ count: 1, title: "2017" }, { count: 1, title: "2018" }, { count: 1, title: "2019" }, { count: 1, title: "2020" }, { count: 1, title: "2022" }, { count: 1, title: "21" }, { count: 3, title: "API" }, { count: 1, title: "Bootcamp" }, { count: 1, title: "CI" }, { count: 1, title: "ChatGPT" }, { count: 1, title: "Clipboard" }, { count: 1, title: "DNS" }, { count: 1, title: "Disqus" }, { count: 1, title: "ETS" }, { count: 1, title: "Elasticsearch" }, { count: 1, title: "Elixir" }, { count: 1, title: "Encoding" }, { count: 1, title: "Erlang" }, { count: 1, title: "Flask" }, { count: 1, title: "FreeBSD" }, { count: 1, title: "GPG" }, { count: 1, title: "GRUB" }, { count: 1, title: "Google-Analytics" }, { count: 1, title: "HTTP" }, { count: 2, title: "Hackintosh" }, { count: 2, title: "Hexo" }, { count: 2, title: "Hitokoto" }, { count: 3, title: "Hugo" }, { count: 1, title: "IPC" }, { count: 1, title: "IPv6" }, { count: 2, title: "Javascript" }, { count: 1, title: "KDE" }, { count: 1, title: "Kindle" }, { count: 1, title: "Kubernetes" }, { count: 3, title: "Linux" }, { count: 1, title: "NexT" }, { count: 1, title: "NextCloud" }, { count: 1, title: "Nginx" }, { count: 1, title: "OpenCL" }, { count: 2, title: "OpenCore" }, { count: 1, title: "PostgreSQL" }, { count: 1, title: "Protocol" }, { count: 6, title: "Python" }, { count: 1, title: "QQ" }, { count: 1, title: "SSH" }, { count: 1, title: "ServiceWorker" }, { count: 1, title: "Socket" }, { count: 1, title: "Solana" }, { count: 1, title: "SolidJS" }, { count: 1, title: "Spacemacs" }, { count: 1, title: "Startpage" }, { count: 1, title: "TLV" }, { count: 1, title: "TTS" }, { count: 1, title: "Tantivy" }, { count: 3, title: "VPS" }, { count: 1, title: "Vanity" }, { count: 1, title: "Ventura" }, { count: 1, title: "Web" }, { count: 1, title: "Web3" }, { count: 1, title: "Windows" }, { count: 1, title: "asyncio" }, { count: 1, title: "backup" }, { count: 1, title: "localStorage" }, { count: 1, title: "super" }, { count: 1, title: "sw-toolbox" }, { count: 1, title: "\u4E00\u8A00" }, { count: 1, title: "\u4E25\u8083\u5411" }, { count: 3, title: "\u4E3B\u9898" }, { count: 1, title: "\u4E66\u63A8" }, { count: 1, title: "\u4E91\u670D\u52A1" }, { count: 1, title: "\u4EE3\u7801" }, { count: 3, title: "\u4F18\u5316" }, { count: 1, title: "\u51FA\u56FD" }, { count: 1, title: "\u526A\u8D34\u677F" }, { count: 8, title: "\u535A\u5BA2" }, { count: 1, title: "\u53CC\u7CFB\u7EDF" }, { count: 1, title: "\u53CD\u5411\u4EE3\u7406" }, { count: 1, title: "\u56FD\u4E52" }, { count: 1, title: "\u56FD\u60C5" }, { count: 1, title: "\u5907\u4EFD" }, { count: 1, title: "\u591A\u7EBF\u7A0B" }, { count: 1, title: "\u5927\u5B66" }, { count: 1, title: "\u5947\u5B89\u4FE1" }, { count: 1, title: "\u5B57\u4F53" }, { count: 1, title: "\u5B57\u5178" }, { count: 2, title: "\u5B66\u751F\u65F6\u4EE3" }, { count: 1, title: "\u5B89\u5168" }, { count: 1, title: "\u5BC6\u7801\u5B66" }, { count: 4, title: "\u5DE5\u4F5C" }, { count: 2, title: "\u5E74\u7EC8\u603B\u7ED3" }, { count: 1, title: "\u5E76\u53D1" }, { count: 2, title: "\u5F00\u7BB1" }, { count: 1, title: "\u5F02\u6B65" }, { count: 2, title: "\u601D\u8003" }, { count: 1, title: "\u6062\u590D" }, { count: 8, title: "\u611F\u60F3" }, { count: 3, title: "\u6210\u957F" }, { count: 1, title: "\u6301\u7EED\u96C6\u6210" }, { count: 1, title: "\u641C\u7D22" }, { count: 1, title: "\u641C\u7D22\u5F15\u64CE" }, { count: 1, title: "\u653F\u6CBB" }, { count: 2, title: "\u6559\u7A0B" }, { count: 1, title: "\u6559\u80B2\u7F51" }, { count: 1, title: "\u6570\u636E" }, { count: 1, title: "\u6570\u636E\u7ED3\u6784" }, { count: 1, title: "\u6587\u6458" }, { count: 1, title: "\u65C5\u6E38" }, { count: 1, title: "\u65C5\u884C" }, { count: 1, title: "\u65E5\u8BB0" }, { count: 2, title: "\u670D\u52A1\u5668" }, { count: 1, title: "\u670D\u52A1\u7AEF" }, { count: 1, title: "\u6742\u8C08" }, { count: 1, title: "\u676D\u5DDE" }, { count: 1, title: "\u6D41\u91CF\u6D4B\u8BD5" }, { count: 2, title: "\u751F\u6D3B" }, { count: 1, title: "\u7535\u5B50\u4E66" }, { count: 1, title: "\u7535\u5F71" }, { count: 1, title: "\u767E\u5EA6\u4E91" }, { count: 1, title: "\u767E\u5EA6\u4E91\u52A0\u901F" }, { count: 2, title: "\u77E5\u591A\u5C11" }, { count: 1, title: "\u7834\u89E3\u6821\u56ED\u7F51" }, { count: 2, title: "\u79BB\u804C" }, { count: 2, title: "\u79D1\u5B66\u4E0A\u7F51" }, { count: 2, title: "\u7B14\u8BB0" }, { count: 1, title: "\u7B80\u8BC4" }, { count: 1, title: "\u7EE7\u627F" }, { count: 1, title: "\u7F16\u7A0B" }, { count: 1, title: "\u7F16\u8F91\u5668" }, { count: 1, title: "\u7F51\u6613\u4E91" }, { count: 1, title: "\u8868\u60C5\u5305" }, { count: 1, title: "\u8BA1\u5212" }, { count: 1, title: "\u8BA1\u7B97\u673A\u7F51\u7EDC" }, { count: 1, title: "\u8BA2\u9605\u670D\u52A1" }, { count: 1, title: "\u8BB0\u5F55" }, { count: 2, title: "\u8BBE\u8BA1" }, { count: 1, title: "\u8BBF\u95EE\u7EDF\u8BA1" }, { count: 1, title: "\u8BC4\u6D4B" }, { count: 1, title: "\u8BC4\u8BBA" }, { count: 1, title: "\u8BED\u97F3\u52A9\u624B" }, { count: 1, title: "\u8C46\u74E3" }, { count: 1, title: "\u94FE\u5F0F\u4EE3\u7406" }, { count: 1, title: "\u952E\u76D8" }, { count: 1, title: "\u9650\u6D41" }, { count: 1, title: "\u9650\u901F" }, { count: 1, title: "\u968F\u611F" }, { count: 3, title: "\u968F\u7B14" }, { count: 1, title: "\u9762\u7ECF" }, { count: 1, title: "\u97E9\u56FD" }, { count: 1, title: "\u97F3\u4E50\u89E3\u6790" }, { count: 1, title: "\u9AD8\u4E2D" }, { count: 1, title: "\u9AD8\u7EA7" }, { count: 1, title: "\u9ED1\u5BA2\u4E0E\u753B\u5BB6" }, { count: 2, title: "\u9ED1\u82F9\u679C" }]
};

// plugin/statsPreload.ts
var groupByYear = (posts) => {
  let byYears = {};
  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!byYears[year])
      byYears[`${year}`] = 0;
    byYears[year] += 1;
  });
  return byYears;
};
var groupByYearDetail = (posts) => {
  let byYears = { undefined: [] };
  posts.forEach((post) => {
    const year = new Date(post.date).getFullYear();
    if (!byYears[year])
      byYears[`${year}`] = [];
    const ret = { slug: `/posts/${post.slug}/` };
    if (post.subtitle)
      ret["subtitle"] = post.subtitle;
    ret["title"] = post.title;
    ret["category"] = post.category;
    ret["data"] = post.date;
    byYears[year].push(ret);
  });
  return byYears;
};
var wordsCount = posts_default.pages.reduce((acc, post) => {
  return acc + post.words;
}, 0);
var totalPosts = posts_default.pages.length;
var en_posts = posts_default.pages.filter((post) => post.lang !== void 0).filter((x) => x.lang?.startsWith("zh")).map(
  (x) => x.slug.endsWith("-zh") ? x.slug.replace("-zh", "-en") : x.slug + "-en"
).concat(base_default.pages.map((x) => `${x.slug}-en`)).concat(["archives-en"]).concat(posts_default.pages.filter((post) => post.lang === "en").map((x) => x.slug));
var totalTags = tags_default.pages.length;
var totalCategories = category_default.pages;
var postsByYear = groupByYear(posts_default.pages);
var postsByYearDetail = groupByYearDetail(posts_default.pages);
var zh_nav_pages = base_default.pages.map((x) => x.slug).filter((x) => !x.includes("search"));
var en_nav_pages = zh_nav_pages.map((x) => `${x}-en`);

// app.config.ts
var isProd = process.env.NODE_ENV === "production";
var BlogConf = {
  title: "Wincer's Blog",
  avatar: "https://ae02.alicdn.com/kf/Aeadf9a8f9b1246a580924fc003e514c8E.jpg",
  extURL: "https://blog-exts.itswincer.com",
  baseURL: "https://blog.itswincer.com",
  cdnURL: "https://cdn.blog.itswincer.net",
  description: "\u8FD9\u91CC\u662F @Wincer,\u559C\u6B22\u6298\u817E\u65B0\u6280\u672F,\u5374\u6CA1\u591A\u5927\u8010\u5FC3\u3002\u4E2A\u4EBA\u535A\u5BA2\u4F1A\u5199\u5F97\u6BD4\u8F83\u6742,\u5305\u62EC\u65E5\u5E38\u5410\u69FD\u3001\u6280\u672F\u8E29\u5751,\u5076\u5C14\u4F1A\u5199\u6B63\u7ECF\u4E00\u70B9\u7684\u3002\u6B22\u8FCE\u8BA2\u9605 RSS(\u2022\u0300\u1D17\u2022\u0301)\u3002",
  keywords: "Blog, \u535A\u5BA2, Web, \u751F\u6D3B, Wincer, Linux, Dev, FreeBSD, Elixir, Python, JavaScript",
  author: {
    name: "Wincer",
    url: "https://itswincer.com"
  }
};
var definedVars = {
  __WORDS: wordsCount,
  __ALL_TAGS: totalTags,
  __TOTAL_POSTS: totalPosts,
  __IS_PROD: isProd,
  __POSTS_BY_YEAR: postsByYear,
  __POSTS_BY_YEAR_DETAIL: JSON.stringify(postsByYearDetail),
  __EN_POSTS: en_posts,
  __EN_NAV: JSON.stringify(en_nav_pages),
  __ZH_NAV: JSON.stringify(zh_nav_pages),
  __TOTAL_CATEGORIES: totalCategories,
  __SITE_CONF: BlogConf
};
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app_config_default = defineConfig({
  extensions: ["ts", "tsx", "js", "jsx"],
  server: {
    prerender: {
      crawlLinks: true
    }
  },
  vite: {
    resolve: {
      alias: {
        "~": path2.resolve(__dirname, "src"),
        "@": path2.resolve(__dirname, "")
      }
    },
    define: definedVars,
    plugins: [
      Icons({ autoInstall: true, compiler: "solid" }),
      jsonx_default(),
      UnoCSS()
    ],
    build: {
      sourcemap: false
    }
  }
});
export {
  app_config_default as default
};
