(element
    (STag
        (Name) @startTag.name
    )
) @_.domain

;; Xml errors when there is no closing tag
(ERROR
    (STag
        (Name) @startTag.name
    )
) @_.domain
