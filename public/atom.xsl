<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/atom:feed">
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="atom:title" /></title>
        <link rel="stylesheet" href="/sass/atom.css" />
      </head>
      <body>
        <h1><xsl:value-of select="atom:title" /></h1>
        <p>This is an Atom feed. Subscribe with an RSS/Atom reader.</p>
        <p>
          <a>
            <xsl:attribute name="href">
              <xsl:value-of select="atom:link[@rel='self']/@href" />
            </xsl:attribute>
            View raw XML
          </a>
        </p>
        <hr />
        <xsl:for-each select="atom:entry">
          <article>
            <h2>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="atom:link[@rel='alternate']/@href" />
                </xsl:attribute>
                <xsl:value-of select="atom:title" />
              </a>
            </h2>
            <p>
              <strong>Published:</strong> <xsl:value-of select="atom:published" />
              <xsl:text> · </xsl:text>
              <strong>Updated:</strong> <xsl:value-of select="atom:updated" />
            </p>
            <div>
              <xsl:value-of select="atom:summary" />
            </div>
            <hr />
          </article>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
