type DocumentContentsProps = {
    documentHTML: { __html: string | TrustedHTML; }
}

function DocumentContents({ documentHTML }: DocumentContentsProps) {

    return (
        <article className='prose lg:prose-lg mx-auto px-4'>
            <div id="doc-container" dangerouslySetInnerHTML={documentHTML} />
        </article>
    )
}

export default DocumentContents
