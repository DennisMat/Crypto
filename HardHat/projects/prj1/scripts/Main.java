package com.test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Main {

	public static void main(String[] args) {

		for (int i = 0; i < 5; i++) {
			// System.out.println("Iteration: " + i);
		}

		HashMap<String, Integer> map = new HashMap<>();
		map.put("A", 10);
		map.put("B", 20);
		map.put("C", 30);

		for (HashMap.Entry<String, Integer> entry : map.entrySet()) {
			// System.out.println("Key: " + entry.getKey() + ", Value: " +
			// entry.getValue());
		}

		String[] routers = { "router1", "router2", "router3", "router4" };
		String[] tokens = { "token1", "token2", "token3",};

		

		List<String[]> routerPairs = getPairs(routers);
		List<String[]> tokenPairs = getPairs(tokens);
		
		List<String[][]> routerTokenPairs = getRouterTokenPairs(routerPairs, tokenPairs ) ;
		
		for (int i = 0; i < routerTokenPairs.size(); i++) {
			
			
			 System.out.println(routerTokenPairs.get(i)[0][0] + "-" + routerTokenPairs.get(i)[0][1]
					+ ", "+ routerTokenPairs.get(i)[1][0] + "-" + routerTokenPairs.get(i)[1][1]
					 );
		}
		
		

	}

	private static List<String[]> getPairs(String[] strArray) {
		List<String[]> strPairs = new ArrayList<String[]>();
		for (int i = 0; i < strArray.length - 1; i++) {

			for (int j = i + 1; j < strArray.length; j++) {
				if (i != j) {
					String[] s = { strArray[i], strArray[j] };
					strPairs.add(s);
					//System.out.println(routers[i] + "-" + routers[j]);
				}

			}

		}
		return strPairs;
	}
	
	private static List<String[][]> getRouterTokenPairs(List<String[]> routerPairs,List<String[]> tokenPairs ) {
		
		List<String[][]> routerTokenPairs = new ArrayList<String[][]>();
		
		for (int i = 0; i < routerPairs.size(); i++) {
		//for (int i = 0; i < 1; i++) {
			for (int j = 0; j < tokenPairs.size(); j++) {
				 String[][] routerTokenPair= {routerPairs.get(i),tokenPairs.get(j)};
				 routerTokenPairs.add(routerTokenPair);
				 
			}
		}
		
		return routerTokenPairs;
	
	}
	

}
