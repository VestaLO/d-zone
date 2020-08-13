import { Attributes, Not, System } from 'ecsy'
import Sprite from '../components/Sprite'
import PixiSprite from '../components/PixiSprite'
import * as PIXI from 'pixi.js'

export default class SpriteSystem extends System {
	private resources: any
	private renderer: any
	init(attributes: Attributes) {
		this.resources = attributes.resources
		this.renderer = attributes.renderer
	}
	execute(_delta: number, _time: number) {
		let updated = this.queries.updated.changed!
		if (updated) {
			for (let i = updated.length - 1; i >= 0; i--) {
				let entity = updated[i]
				let sprite = entity.getComponent!(Sprite)
				let pixiSprite = entity.getComponent!(PixiSprite)
				pixiSprite.value.setTransform(sprite.x, sprite.y)
				pixiSprite.value.zIndex = sprite.zIndex
			}
		}

		let added = this.queries.added.results
		for (let i = added.length - 1; i >= 0; i--) {
			let entity = added[i]
			let sprite = entity.getComponent!(Sprite)
			let pixiSprite = new PIXI.Sprite(this.resources.textures[sprite.sheet])
			pixiSprite.setTransform(sprite.x, sprite.y)
			pixiSprite.zIndex = sprite.zIndex
			this.renderer.app.stage.addChild(pixiSprite)
			entity.addComponent(PixiSprite, { value: pixiSprite })
		}

		let removed = this.queries.removed.results
		for (let i = removed.length - 1; i >= 0; i--) {
			let entity = removed[i]
			let pixiSprite = entity.getComponent!(PixiSprite)
			this.renderer.app.stage.removeChild(pixiSprite.value)
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
