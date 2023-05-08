import PageLayout from "~/components/layouts/PageLayout";
import { BasePage } from "~/schema/Page";

const page: BasePage = {
  title: "404 Not Found",
  date: new Date(),
  content: "您访问的页面已经消失得无影无踪，就像我的前任一样。",
  slug: "404",
  summary: "您访问的页面已经消失得无影无踪，就像我的前任一样。"
}

export default function NotFound() {
  return (
    <>
      <PageLayout page={page} showComment={false}>
        <section>
          <p class=":: text-xl mb-8 leading-relaxed">{page.content}</p>
        </section>
      </PageLayout>
    </>
  );
}
