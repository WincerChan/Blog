<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>XML Sitemap</title>
        <link rel="stylesheet" href="/sass/sitemap.css" />
      </head>
      <body>
        <header class="container">
          <h1>XML Sitemap</h1>
          <p class="desc">
            This XML file is used by search engines to discover pages on this site.
            <span class="muted">（用于搜索引擎抓取，不是给人类阅读的内容页）</span>
          </p>
          <div class="toolbar">
            <input id="filter" class="filter" type="search" placeholder="Filter URLs…" />
            <span class="count">
              <xsl:choose>
                <xsl:when test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                  <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /> sitemaps
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
                </xsl:otherwise>
              </xsl:choose>
            </span>
          </div>
        </header>

        <main class="container">
          <xsl:choose>
            <xsl:when test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
              <table class="table" id="sitemap-table">
                <thead>
                  <tr>
                    <th>Sitemap</th>
                    <th class="nowrap">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <xsl:variable name="sitemapURL">
                      <xsl:value-of select="sitemap:loc" />
                    </xsl:variable>
                    <tr>
                      <td class="url">
                        <a href="{$sitemapURL}">
                          <xsl:value-of select="sitemap:loc" />
                        </a>
                      </td>
                      <td class="nowrap">
                        <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <table class="table" id="sitemap-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th class="nowrap" title="Priority">Prio</th>
                    <th class="nowrap" title="Images">Img</th>
                    <th class="nowrap" title="Change Frequency">Freq</th>
                    <th class="nowrap" title="Last Modification Time">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'" />
                  <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td class="url">
                        <xsl:variable name="itemURL">
                          <xsl:value-of select="sitemap:loc" />
                        </xsl:variable>
                        <a href="{$itemURL}">
                          <xsl:value-of select="sitemap:loc" />
                        </a>
                      </td>
                      <td class="nowrap">
                        <xsl:value-of select="concat(sitemap:priority*100,'%')" />
                      </td>
                      <td class="nowrap">
                        <xsl:value-of select="count(image:image)" />
                      </td>
                      <td class="nowrap">
                        <xsl:value-of
                          select="concat(translate(substring(sitemap:changefreq, 1, 1),concat($lower, $upper),concat($upper, $lower)),substring(sitemap:changefreq, 2))" />
                      </td>
                      <td class="nowrap">
                        <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))" />
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>

        <script>
          (function () {
            var input = document.getElementById('filter');
            var table = document.getElementById('sitemap-table');
            if (!input || !table) return;
            var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
            input.addEventListener('input', function () {
              var q = (input.value || '').toLowerCase();
              for (var i = 0; i &lt; rows.length; i++) {
                var row = rows[i];
                var t = (row.textContent || '').toLowerCase();
                row.style.display = t.indexOf(q) !== -1 ? '' : 'none';
              }
            });
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
