{{ $pages := where .CurrentSection.RegularPages "Params.layout" "==" "base" }}
export default {
    "title": "{{ .Title }}",
    "date": "{{ .Date.Format `2006-01-02T15:04:05+0800` }}",
    {{ with .Params.Updated }}
    "updated": "{{ (.Params.Updated | time).Format `2006-01-02T15:04:05+0800` }}",
    {{ end }}
    "slug": "/{{ .Params.Slug }}/",
    "summary": {{ .Summary | jsonify }},
    {{ with .Params.Cover }}
    "cover" : "{{ . }}",
    {{ end }}
    {{ if ne .Params.isTranslation nil }}
    "isTranslation": {{ .Params.isTranslation }},
    {{ end }}
    {{ with .Params.lang }}
    "lang": "{{ . }}",
    {{ end }}
    {{ if eq .Title "Pages" }}
    "pages": [
      {{ range $index, $page := sort $pages "Params.Weight" }}
      {
        "title": "{{ $page.Title }}",
        "slug": "{{ $page.Slug }}"
      }{{ if lt $index (sub (len $pages) 1) }},{{ end }}
      {{ end }}
    ]
    {{ else }}
    "content": {{ .Content |  replaceRE `style=".*"` `` | safeHTML | jsonify  }}
    {{ end }}
}