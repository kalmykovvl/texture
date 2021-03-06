import { Component } from 'substance'
import Button from './Button'

export default class RefComponent extends Component {

  didMount() {
    this.context.editorSession.on('ref:updated', this._onRefUpdated, this)
    // HACK: Ensure we trigger a rerender whenever the article-title or chapter-title is changed
    let node = this.props.node
    let title = node.find('article-title') || node.find('chapter-title')
    if (title) {
      this.context.editorSession.onRender('document', this.rerender, this, {
        path: title.getPath()
      })
    }
  }

  dispose() {
    this.context.editorSession.off(this)
  }

  _onRefUpdated(refId) {
    if (this.props.node.id === refId) {
      this.rerender()
    }
  }

  render($$) {
    let el = $$('div').addClass('sc-ref')
    let ref = this.props.node
    let label = this.context.labelGenerator.getPosition('bibr', ref.id)
    let elementCitation = ref.find('element-citation')

    if (label) {
      el.append(
        $$('div').addClass('se-label').append(
          label
        )
      )
    }

    if (elementCitation) {
      let publicationType = elementCitation.getAttribute('publication-type')
      let PreviewComp = this.getComponent(publicationType + '-citation-preview', true)

      if(PreviewComp) {
        el.append(
          $$(PreviewComp, {node: elementCitation})
            .addClass('sm-element-citation-preview')
            .on('click', this._editRef)
        )
      } else {
        el.append(
          'No preview component found for publicationtype: ' + publicationType
        )
      }
    } else {
      console.warn('No element citation found')
    }

    el.append(
      $$(Button, {icon: 'trash', tooltip: 'remove'}).addClass('se-remove-ref')
        .on('click', this._removeRef.bind(this, ref.id))
    )

    return el
  }

  _editRef() {
    this.send('switchContext', {
      contextId: 'edit-ref',
      nodeId: this.props.node.id
    })
  }

  _removeRef(refId) {
    this.send('removeRef', refId)
  }
}
