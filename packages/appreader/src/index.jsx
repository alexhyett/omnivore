import React from 'react'
import ReactDOM from 'react-dom'
import { Box, VStack } from '@omnivore/web/components/elements/LayoutPrimitives'
import { ArticleContainer } from '@omnivore/web/components/templates/article/ArticleContainer'
import { applyStoredTheme } from '@omnivore/web/lib/themeUpdater'
import '@omnivore/web/styles/globals.css'
import '@omnivore/web/styles/articleInnerStyling.css'

const mutation = async (name, input) => {
  if (window.webkit) {
    // Send iOS a message
    const result =
      await window?.webkit?.messageHandlers.articleAction?.postMessage({
        actionID: name,
        ...input,
      })
    console.log('action result', result, result.result)
    return result.result
  } else {
    // Send android a message
    console.log('sending android a message', name, input)
    AndroidWebKitMessenger.handleIdentifiableMessage(
      name,
      JSON.stringify(input)
    )

    // TODO: handle errors
    switch (name) {
      case 'createHighlight':
        return input
      case 'deleteHighlight':
        return true
      case 'mergeHighlight':
        return {
          id: input['id'],
          shortID: input['shortId'],
          quote: input['quote'],
          patch: input['patch'],
          createdByMe: true,
          labels: [],
        }
      case 'updateHighlight':
        return true
      case 'articleReadingProgress':
        return true
      default:
        return true
    }
  }
}

const App = () => {
  applyStoredTheme(false)

  const useForceUpdate = () => {
    const [, setState] = React.useState();
    return () => setState({});
  }
  
  const forceUpdate = useForceUpdate();
  
  document.addEventListener('updateLabels', (event) => {
    console.log("updating labels: ", event.labels)
    const updated = window.omnivoreArticle
    updated.labels = event.labels
    window.omnivoreArticle = updated
    forceUpdate();
  })

  document.addEventListener('updateTitle', (event) => {
    console.log("updating title: ", event.title)
    const updated = window.omnivoreArticle
    updated.title = event.title
    window.omnivoreArticle = updated
    forceUpdate();
  })

  return (
    <>
      <Box
        css={{
          overflowY: 'auto',
          height: '100%',
          width: '100vw',
        }}
      >
        <VStack
          alignment="center"
          distribution="center"
          className="disable-webkit-callout"
        >
          <ArticleContainer
            article={window.omnivoreArticle}
            labels={window.omnivoreArticle.labels}
            isAppleAppEmbed={true}
            highlightBarDisabled={!window.enableHighlightBar}
            fontSize={window.fontSize ?? 18}
            fontFamily={window.fontFamily ?? 'inter'}
            margin={window.margin}
            maxWidthPercentage={window.maxWidthPercentage}
            lineHeight={window.lineHeight}
            highContrastFont={window.prefersHighContrastFont ?? true}
            articleMutations={{
              createHighlightMutation: (input) =>
                mutation('createHighlight', input),
              deleteHighlightMutation: (highlightId) =>
                mutation('deleteHighlight', { highlightId }),
              mergeHighlightMutation: (input) =>
                mutation('mergeHighlight', input),
              updateHighlightMutation: (input) =>
                mutation('updateHighlight', input),
              articleReadingProgressMutation: (input) =>
                mutation('articleReadingProgress', input),
            }}
          />
        </VStack>
      </Box>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
