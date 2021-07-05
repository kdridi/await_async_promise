const rec =
	(f) =>
	(...args) =>
		f((...args) => rec(f)(...args), ...args)
const has = (key, obj) => obj && typeof obj[key] === 'function'

const createAsyncFn =
	(binder, pure) =>
	(generatorFn) =>
	(...args) =>
		pure()[binder](() => {
			const iterator = generatorFn(...args)()
			return rec((step, next_value) => {
				const { done, value } = iterator.next(next_value)
				const result = has(binder, value) ? value : pure(value)
				return done ? result : result[binder](step)
			})()
		})

const promise_async = createAsyncFn('then', (value) => Promise.resolve(value))

const main0 = promise_async(
	(aa, bb, cc) =>
		function* () {
			const a = yield aa
			const b = yield Promise.resolve(bb)
			const c = yield Promise.resolve(cc)
			return Promise.resolve(a + b + c)
		}
)

const main1 = async function (aa, bb, cc) {
	const a = await aa
	const b = await Promise.resolve(bb)
	const c = await Promise.resolve(cc)
	return Promise.resolve(a + b + c)
}

main0(1, 22, 333)
	.then(
		(res) => console.log(res),
		(err) => console.error(`err: ${err}`)
	)
	.catch((err) => console.log(0))

main1(1, 22, 333)
	.then(
		(res) => console.log(res),
		(err) => console.error(`err: ${err}`)
	)
	.catch((err) => console.log(0))
