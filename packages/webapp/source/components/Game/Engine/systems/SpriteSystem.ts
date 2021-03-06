import { Attributes, Not, System } from 'ecsy'
import Sprite from '../components/Sprite'
import PixiSprite from '../components/PixiSprite'
import * as PIXI from 'pixi.js-legacy'

export default class SpriteSystem extends System {
	private resources: any
	private renderer: any
	private textures: any
	private view: any
	private cull: any
	init(attributes: Attributes) {
		this.resources = attributes.resources
		this.textures = this.resources.sheet.textures
		this.renderer = attributes.renderer
		this.view = this.renderer.view
		this.cull = this.renderer.cull
	}
	execute(_delta: number, _time: number) {
		let updated = this.queries.updated.changed!
		if (updated) {
			for (let i = updated.length - 1; i >= 0; i--) {
				let entity = updated[i]
				let sprite = entity.getComponent(Sprite)!
				let { value: pixiSprite } = entity.getComponent(PixiSprite)!
				pixiSprite.setTransform(sprite.x, sprite.y)
				pixiSprite.zIndex = sprite.zIndex
				pixiSprite.texture = this.textures[sprite.texture]
				pixiSprite.anchor = pixiSprite.texture.defaultAnchor
				this.cull.updateObject(pixiSprite)
			}
			this.cull.cull(this.view.getVisibleBounds())
		}

		let added = this.queries.added.results
		for (let i = added.length - 1; i >= 0; i--) {
			let entity = added[i]
			let sprite = entity.getComponent(Sprite)!
			let pixiSprite = new PIXI.Sprite(
				this.resources.sheet.textures[sprite.texture]
			)
			pixiSprite.setTransform(sprite.x, sprite.y)
			pixiSprite.zIndex = sprite.zIndex
			this.view.addChild(pixiSprite)
			entity.addComponent(PixiSprite, { value: pixiSprite })
		}

		let removed = this.queries.removed.results
		for (let i = removed.length - 1; i >= 0; i--) {
			let entity = removed[i]
			let pixiSprite = entity.getComponent(PixiSprite)!
			this.view.removeChild(pixiSprite.value)
			pixiSprite.value.destroy()
			entity.removeComponent(PixiSprite)
		}
	}
}
SpriteSystem.queries = {
	added: { components: [Sprite, Not(PixiSprite)] },
	removed: { components: [Not(Sprite), PixiSprite] },
	updated: { components: [Sprite, PixiSprite], listen: { changed: [Sprite] } },
}
