import { describe, expect, it } from "vitest";
import { resolveResultActions } from "./capabilities";

const share = () => Promise.resolve();

describe("resolveResultActions", () => {
	it("セキュアコンテキストで share があれば共有を出す", () => {
		expect(
			resolveResultActions({ isSecureContext: true, navigator: { share } })
				.share,
		).toBe(true);
	});

	it("非セキュアコンテキストでは share があっても共有を出さない", () => {
		expect(
			resolveResultActions({ isSecureContext: false, navigator: { share } })
				.share,
		).toBe(false);
	});

	it("セキュアかどうか分からなければ共有を出さない", () => {
		expect(resolveResultActions({ navigator: { share } }).share).toBe(false);
	});

	it("share が無ければ共有を出さない", () => {
		expect(
			resolveResultActions({ isSecureContext: true, navigator: {} }).share,
		).toBe(false);
	});

	it("navigator が無ければ共有を出さない", () => {
		expect(resolveResultActions({ isSecureContext: true }).share).toBe(false);
	});

	it("share が関数でなければ共有を出さない", () => {
		expect(
			resolveResultActions({
				isSecureContext: true,
				navigator: { share: "share" },
			}).share,
		).toBe(false);
	});

	it("非セキュアコンテキストのときだけ案内を出す", () => {
		expect(resolveResultActions({ isSecureContext: false }).insecureNote).toBe(
			true,
		);
		expect(resolveResultActions({ isSecureContext: true }).insecureNote).toBe(
			false,
		);
		expect(resolveResultActions({}).insecureNote).toBe(false);
	});
});
