import { ActivityIndicator, View } from "react-native";

export function WithLoadingCenter({ isLoading, children }: { isLoading: boolean, children: React.ReactNode }) {
	if (isLoading) {
		return (
			<View style={{
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "flex-start",
				paddingTop: 50,
			}}>
				<ActivityIndicator />
			</View>
		)
	}

	return (
		<View style={{ flex: 1 }}>
			{children}
		</View>
	)
}
